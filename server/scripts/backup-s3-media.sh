#!/bin/bash
# S3 Media Backup Script
# Usage: Run every 6 hours via cron

set -euo pipeafail

# Configuration
SOURCE_BUCKET="${S3_MEDIA_BUCKET:-}"
BACKUP_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_PREFIX="backups-media"
DATE=$(date +%Y%m%d_%H%M%S)

# Validate required env vars
if [ -z "$SOURCE_BUCKET" ] || [ -z "$BACKUP_BUCKET" ]; then
    echo "ERROR: S3_MEDIA_BUCKET and S3_BACKUP_BUCKET environment variables are required"
    exit 1
fi

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
error_handler() {
    log "ERROR: S3 media backup failed!"
    # Send alert to Sentry/monitoring
    exit 1
}

trap error_handler ERR

# Incremental sync
log "Starting incremental sync from s3://${SOURCE_BUCKET}/ to s3://${BACKUP_BUCKET}/${S3_PREFIX}/${DATE}/"
aws s3 sync "s3://${SOURCE_BUCKET}/" \
    "s3://${BACKUP_BUCKET}/${S3_PREFIX}/${DATE}/" \
    --storage-class STANDARD_IA \
    --exclude "cache/*" \
    --exclude "tmp/*" \
    --exclude "*.tmp"

# Cleanup old backups (keep last 90 days)
log "Cleaning up old backups..."
CUTOFF_DATE=$(date -d "-90 days" +%Y%m%d 2>/dev/null || date -v-90d +%Y%m%d)

aws s3 ls "s3://${BACKUP_BUCKET}/${S3_PREFIX}/" | \
    awk '{print $2}' | \
    grep -E '^[0-9]{8}_[0-9]{6}/$' | \
    while read -r prefix; do
        PREFIX_DATE=$(echo "$prefix" | grep -oE '^[0-9]{8}')
        if [ "${PREFIX_DATE:-}" \< "$CUTOFF_DATE" ]; then
            log "Deleting old backup: $prefix"
            aws s3 rm "s3://${BACKUP_BUCKET}/${S3_PREFIX}/${prefix}" --recursive
        fi
    done

log "S3 media backup completed successfully!"
log "Retention: Last 90 days of media backups available in s3://${BACKUP_BUCKET}/${S3_PREFIX}/"