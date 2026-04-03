# Backup Strategy — Database & S3 Media

> **Status:** Ready for implementation  
> **Last updated:** 2026-04-03  
> **Priority:** P0 (Critical — must be in place before production)

---

## Overview

This document describes the backup strategy for:
- **Database:** PostgreSQL (primary data store)
- **Media files:** S3-compatible storage (product images, documents, etc.)

---

## 1. Database Backups

### 1.1 Backup Types

| Type | Frequency | Retention | Storage Location |
|------|-----------|-----------|------------------|
| **Full backup** | Daily at 02:00 UTC | 30 days | S3 bucket `backups-db/` |
| **Point-in-time recovery (PITR)** | Continuous (WAL archives) | 7 days | S3 bucket `backups-wal/` |
| **On-demand backup** | Manual (before major changes) | 90 days | S3 bucket `backups-manual/` |

### 1.2 Automated Daily Backups

**Script:** `server/scripts/backup-database.sh`

```bash
#!/bin/bash
set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-laravel}"
DB_USER="${DB_USER:-laravel}"
S3_BUCKET="${S3_BACKUP_BUCKET:-myapp-backups}"
S3_PREFIX="backups-db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/db_backup_${DATE}.sql.gz"

# Create backup
echo "Creating database backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE"

# Upload to S3
echo "Uploading to S3..."
aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/${S3_PREFIX}/db_backup_${DATE}.sql.gz" \
  --storage-class STANDARD_IA \
  --metadata "type=daily,created=${DATE}"

# Cleanup local file
rm -f "$BACKUP_FILE"

# Cleanup old backups (keep last 30 days)
echo "Cleaning up old backups..."
aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | \
  awk '{print $4}' | \
  sort | \
  head -n -30 | \
  while read -r file; do
    aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${file}"
  done

echo "Backup completed successfully!"
```

### 1.3 Point-in-Time Recovery (PITR)

**Requirements:**
- PostgreSQL WAL archiving enabled
- `archive_mode = on` in `postgresql.conf`
- `archive_command` configured to upload WAL files to S3

**PostgreSQL Configuration:**

```conf
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://myapp-backups/backups-wal/%f'
max_wal_senders = 3
wal_keep_size = 1GB
```

### 1.4 Backup Schedule (Cron)

**File:** `server/config/cron/backup-cron`

```cron
# Daily database backup at 02:00 UTC
0 2 * * * /var/www/scripts/backup-database.sh >> /var/log/backup-database.log 2>&1

# Weekly backup verification test (Sunday 03:00 UTC)
0 3 * * 0 /var/www/scripts/verify-backup.sh >> /var/log/backup-verify.log 2>&1
```

### 1.5 Backup Verification

**Script:** `server/scripts/verify-backup.sh`

```bash
#!/bin/bash
set -euo pipefail

# Download latest backup
LATEST_BACKUP=$(aws s3 ls "s3://${S3_BUCKET}/backups-db/" | \
  awk '{print $4}' | sort | tail -n 1)

aws s3 cp "s3://${S3_BUCKET}/backups-db/${LATEST_BACKUP}" /tmp/test_backup.sql.gz

# Restore to test database (temporary)
gunzip -c /tmp/test_backup.sql.gz | \
  psql -h localhost -U laravel -d laravel_test

# Verify integrity (check critical tables)
psql -h localhost -U laravel -d laravel_test -c \
  "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM products; SELECT COUNT(*) FROM orders;"

# Cleanup
rm -f /tmp/test_backup.sql.gz

echo "Backup verification completed successfully!"
```

---

## 2. S3 Media Backups

### 2.1 Backup Strategy

| Type | Frequency | Retention | Notes |
|------|-----------|-----------|-------|
| **Incremental sync** | Every 6 hours | N/A | Sync to backup bucket |
| **Cross-region replication** | Real-time | N/A | AWS S3 CRR (if applicable) |
| **Versioning enabled** | Always | Unlimited | S3 versioning on media bucket |

### 2.2 Automated S3 Backup Script

**Script:** `server/scripts/backup-s3-media.sh`

```bash
#!/bin/bash
set -euo pipefail

# Configuration
SOURCE_BUCKET="${S3_MEDIA_BUCKET:-myapp-media}"
BACKUP_BUCKET="${S3_BACKUP_BUCKET:-myapp-backups}"
S3_PREFIX="backups-media"
DATE=$(date +%Y%m%d_%H%M%S)

# Incremental sync
echo "Syncing media files to backup bucket..."
aws s3 sync "s3://${SOURCE_BUCKET}/" \
  "s3://${BACKUP_BUCKET}/${S3_PREFIX}/${DATE}/" \
  --storage-class STANDARD_IA \
  --exclude "cache/*" \
  --exclude "tmp/*"

# Cleanup old backups (keep last 90 days)
echo "Cleaning up old backups..."
aws s3 ls "s3://${BACKUP_BUCKET}/${S3_PREFIX}/" | \
  awk '{print $2}' | \
  sort | \
  head -n -90 | \
  while read -r prefix; do
    aws s3 rm "s3://${BACKUP_BUCKET}/${S3_PREFIX}/${prefix}" --recursive
  done

echo "S3 media backup completed successfully!"
```

### 2.3 S3 Versioning

**Best Practice:** Enable S3 versioning on the media bucket to recover accidentally deleted files.

```bash
aws s3api put-bucket-versioning \
  --bucket myapp-media \
  --versioning-configuration Status=Enabled
```

---

## 3. Recovery Procedures

### 3.1 Database Recovery

**From Daily Backup:**

```bash
# Download backup
aws s3 cp "s3://myapp-backups/backups-db/db_backup_20260403.sql.gz" /tmp/

# Stop app servers
docker compose down

# Restore database
gunzip -c /tmp/db_backup_20260403.sql.gz | \
  psql -h postgres -U laravel -d laravel

# Start app servers
docker compose up -d
```

**Point-in-Time Recovery:**

```bash
# 1. Restore base backup
pg_restore -h postgres -U laravel -d laravel_base /path/to/base_backup

# 2. Replay WAL files up to target time
pg_wal_replay --target-time="2026-04-03 14:30:00"
```

### 3.2 Media Recovery

**Single File:**

```bash
aws s3api get-object \
  --bucket myapp-media \
  --key "products/image.jpg" \
  --version-id "123456789" \
  recovered_image.jpg
```

**Full Bucket Recovery:**

```bash
aws s3 sync "s3://myapp-backups/backups-media/20260403/" \
  "s3://myapp-media/" \
  --storage-class STANDARD
```

---

## 4. Monitoring & Alerting

### 4.1 Backup Health Checks

Add to `spatie/laravel-health` checks:

```php
// config/health.php
use Spatie\Health\Facades\Health;
use Spatie\Health\Checks\Checks\DatabaseCheck;
use Spatie\Health\Checks\Checks\S3MediaCheck;

Health::checks([
    DatabaseCheck::new()
        ->connection('pgsql')
        ->label('Database Health'),
        
    // Custom check for backup status
    \App\Health\BackupStatusCheck::new(),
]);
```

### 4.2 Backup Status Check

**File:** `server/app/Health/BackupStatusCheck.php`

```php
<?php

declare(strict_types=1);

namespace App\Health;

use Spatie\Health\Checks\Check;
use Spatie\Health\Checks\Result;

class BackupStatusCheck extends Check
{
    public function run(): Result
    {
        $lastBackup = $this->getLastBackupTime();
        $hoursSinceBackup = now()->diffInHours($lastBackup);

        if ($hoursSinceBackup > 26) {
            return Result::failed("Last backup was {$hoursSinceBackup} hours ago");
        }

        if ($hoursSinceBackup > 25) {
            return Result::warning("Last backup was {$hoursSinceBackup} hours ago");
        }

        return Result::ok("Last backup was {$hoursSinceBackup} hours ago");
    }

    protected function getLastBackupTime(): \Carbon\Carbon
    {
        // Check S3 for latest backup file metadata
        // Or read from database/cache backup log
    }
}
```

### 4.3 Alerting (Sentry)

Configure Sentry alertsfor:
- Failed backup jobs
- Backup verification failures
- Storage quota exceeded

---

## 5. Security

### 5.1 Encryption at Rest

- **Database backups:** Encrypted via S3 SSE-S3 or SSE-KMS
- **WAL archives:** Encrypted via S3 SSE-KMS
- **Media files:** Encrypted via S3 SSE-S3

### 5.2 Access Control

- Backup scripts run as dedicated IAM user with minimal permissions:
  - `s3:PutObject` to backup bucket
  - `s3:GetObject` from backup bucket
  - `s3:DeleteObject` on backup bucket (for cleanup)
  - No access to production database credentials

### 5.3 Cross-Region Backup (Recommended)

For production, replicate backups to a different AWS region:

```bash
aws s3api put-bucket-replication \
  --bucket myapp-backups \
  --replication-configuration file://replication.json
```

---

## 6. Implementation Checklist

- [ ] Create S3 backup buckets (`myapp-backups`, `myapp-backups-wal`)
- [ ] Create IAM user for backup scripts with minimal permissions
- [ ] Create backup scripts (`backup-database.sh`, `backup-s3-media.sh`, `verify-backup.sh`)
- [ ] Set up cron jobs for automated backups
- [ ] Enable PostgreSQL WAL archiving
- [ ] Enable S3 versioning on media bucket
- [ ] Configure `spatie/laravel-health` backup check
- [ ] Test backup restore procedure (document recovery time)
- [ ] Set up Sentry alerts for backup failures
- [ ] Document RTO/RPO targets
- [ ] Schedule quarterly backup restore tests

---

## 7. RTO/RPO Targets

| Scenario | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|----------|-------------------------------|--------------------------------|
| **Database failure** | < 1 hour | < 1 hour (with PITR) |
| **Media deletion** | < 4 hours | 0 (with versioning) |
| **Region failure** | < 4 hours | < 1 hour |

---

## 8. Costs Estimation

| Item | Monthly Cost (Estimated) |
|------|--------------------------|
| DB backups (30 days, 10GB/day) | ~$3 |
| WAL archives (7 days, 1GB/day) | ~$0.20 |
| Media backups (S3 STANDARD_IA) | ~$0.01/GB |
| S3 versioning overhead | ~$0.05/GB |
| **Total (for 100GB media)** | ~$5-10/month |

---

## References

- [PostgreSQL Backup & Recovery](https://www.postgresql.org/docs/current/backup.html)
- [AWS S3 Cross-Region Replication](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html)
- [Spatie Laravel Health](https://spatie.be/docs/laravel-health)