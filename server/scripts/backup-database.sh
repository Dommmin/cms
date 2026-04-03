#!/bin/bash
# Database Backup Script
# Usage: Run daily via cron at 02:00 UTC

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-laravel}"
DB_USER="${DB_USER:-laravel}"
S3_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_PREFIX="backups-db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/db_backup_${DATE}.sql.gz"

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
    log "ERROR: Backup failed!"
    rm -f "$BACKUP_FILE"
    # Send alert to Sentry/monitoring
    exit 1
}

trap error_handler ERR

# Check if database is accessible
log "Checking database connectivity..."
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
    log "ERROR: Cannot connect to database at $DB_HOST:$DB_PORT"
    exit 1
fi

# Create backup
log "Creating database backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl --clean --if-exists \
    | gzip > "$BACKUP_FILE"

# Check backup size
BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
log "Backup size: $((BACKUP_SIZE / 1024 / 1024)) MB"

# Upload to S3
log "Uploading backup to S3..."
aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/${S3_PREFIX}/db_backup_${DATE}.sql.gz" \
    --storage-class STANDARD_IA \
    --metadata "type=daily,created=${DATE},size=${BACKUP_SIZE}"

# Cleanup local file
rm -f "$BACKUP_FILE"
log "Local backup file removed"

# Cleanup old backups (keep last 30 days)
log "Cleaning up old backups..."
aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | \
    grep "db_backup_" | \
    awk '{print $4}' | \
    sort | \
    head -n -30 | \
    while read -r file; do
        if [ -n "$file" ]; then
            log "Deleting old backup: $file"
            aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${file}"
        fi
    done

log "Backup completed successfully!"
log "Retention: Last 30 days of backups available in s3://${S3_BUCKET}/${S3_PREFIX}/"