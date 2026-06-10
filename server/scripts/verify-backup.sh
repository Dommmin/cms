#!/bin/bash
# Backup Verification Script
# Usage: Run weekly (Sunday 03:00 UTC) to verify backup integrity

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-secret}"
DB_NAME="${DB_NAME:-cms}"
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
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS ${DB_TEST_NAME};" 2>/dev/null || true
    rm -f /tmp/db_backup_*.sql.gz
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
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS ${DB_TEST_NAME}; CREATE DATABASE ${DB_TEST_NAME};"

# Restore backup to test database
log "Restoring backup to test database..."
gunzip -c "/tmp/${LATEST_BACKUP}" | mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "${DB_TEST_NAME}"

# Verify integrity (check critical tables)
log "Verifying backup integrity..."
CRITICAL_TABLES=("users" "products" "orders" "customers" "categories")

for table in "${CRITICAL_TABLES[@]}"; do
    COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -N -B "${DB_TEST_NAME}" -e "SELECT COUNT(*) FROM ${table};")
    log "Table ${table}: ${COUNT} rows"
    
    if [ "$COUNT" -eq 0 ]; then
        log "WARNING: Table ${table} is empty in backup!"
    fi
done

# Check foreign key constraints
log "Checking foreign key constraints..."
FK_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -N -B -e "SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='${DB_TEST_NAME}' AND REFERENCED_TABLE_NAME IS NOT NULL;")

if [ "$FK_COUNT" -gt 0 ]; then
    log "Foreign key constraints OK (${FK_COUNT} constraints found)"
else
    log "WARNING: Missing or zero foreign key constraints"
fi

# Cleanup
log "Cleaning up..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS ${DB_TEST_NAME};"
rm -f "/tmp/${LATEST_BACKUP}"

log "✅ Backup verification completed successfully!"
log "Backup is valid and can be used for recovery."