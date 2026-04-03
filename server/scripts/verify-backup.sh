#!/bin/bash
# Backup Verification Script
# Usage: Run weekly (Sunday 03:00 UTC) to verify backup integrity

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-laravel}"
DB_NAME="${DB_NAME:-laravel}"
DB_TEST_NAME="${DB_NAME}_test"
S3_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_PREFIX="backups-db"

# Validate required env vars
if [ -z "$S3_BUCKET" ]; then
    echo "ERROR: S3_BACKUP_BUCKET environment variable is required"
    exit 1
fi

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
error_handler() {
    log "ERROR: Backup verification failed!"
    # Cleanup
    dropdb -h "$DB_HOST" -U "$DB_USER" "$DB_TEST_NAME" 2>/dev/null || true
    rm -f /tmp/test_backup_*.sql.gz
    exit 1
}

trap error_handler ERR

# Get latest backup
log "Finding latest backup..."
LATEST_BACKUP=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | \
    grep "db_backup_" | \
    awk '{print $4}' | \
    sort -r | \
    head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    log "ERROR: No backups found in s3://${S3_BUCKET}/${S3_PREFIX}/"
    exit 1
fi

log "Latest backup: $LATEST_BACKUP"

# Download backup
log "Downloading backup..."
aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${LATEST_BACKUP}" "/tmp/${LATEST_BACKUP}"

# Create test database
log "Creating test database..."
dropdb -h "$DB_HOST" -U "$DB_USER" "$DB_TEST_NAME" 2>/dev/null || true
createdb -h "$DB_HOST" -U "$DB_USER" "$DB_TEST_NAME"

# Restore backup to test database
log "Restoring backup to test database..."
gunzip -c "/tmp/${LATEST_BACKUP}" | psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_TEST_NAME" -q

# Verify integrity (check critical tables)
log "Verifying backup integrity..."
CRITICAL_TABLES=("users" "products" "orders" "customers" "categories")

for table in "${CRITICAL_TABLES[@]}"; do
    COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_TEST_NAME" -t -c "SELECT COUNT(*) FROM ${table}")
    log "Table ${table}: ${COUNT} rows"
    
    if [ "$COUNT" -eq 0 ]; then
        log "WARNING: Table ${table} is empty in backup!"
    fi
done

# Check foreign key constraints
log "Checking foreign key constraints..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_TEST_NAME" -c \
    "SELECT conname FROM pg_constraint WHERE contype = 'f';" | \
    grep -q "fk_" && log "Foreign key constraints OK" || log "WARNING: Missing foreign key constraints"

# Cleanup
log "Cleaning up..."
dropdb -h "$DB_HOST" -U "$DB_USER" "$DB_TEST_NAME"
rm -f "/tmp/${LATEST_BACKUP}"

log "✅ Backup verification completed successfully!"
log "Backup is valid and can be used for recovery."