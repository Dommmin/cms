# Disaster Recovery Plan

## RTO/RPO Targets

| System | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|--------|-------------------------------|--------------------------------|
| Database | 1 hour | 15 minutes |
| Application | 30 minutes | N/A (stateless) |
| Media Storage (S3) | 4 hours | 1 hour |
| Redis Cache | N/A | N/A (rebuild from DB) |

## Backup Strategy

### Database Backups

**Automated Backups:**
- **Frequency**: Every 15 minutes (incremental), daily full backup at 02:00
- **Location**: AWS S3 `s3://cms-backups/database/`
- **Retention**: 
  - Hourly backups: 24 hours
  - Daily backups: 30 days
  - Weekly backups: 12 weeks
  - Monthly backups: 12 months

**Backup Script**: `scripts/backup-database.sh`
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
DATABASE=cms
BACKUP_PATH="/backups/mysql"

mysqldump --single-transaction --routines --triggers $DATABASE | gzip > $BACKUP_PATH/cms_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_PATH/cms_$DATE.sql.gz s3://cms-backups/database/

# Clean old backups
find $BACKUP_PATH -name "*.gz" -mtime +30 -delete
```

**Cron Configuration** (`sudo crontab -e`):
```cron
*/15 * * * * /var/www/cms/scripts/backup-database.sh incremental
0 2 * * * /var/www/cms/scripts/backup-database.sh full
```

### Media Backups (S3)

**S3 Versioning**: Enabled on `cms-media` bucket

**Cross-Region Replication**: 
- Source: `eu-central-1`
- Destination: `eu-west-1`

**Backup Script**: `scripts/backup-media.sh`
```bash
#!/bin/bash
aws s3 sync s3://cms-media s3://cms-media-backup-$(date +%Y%m%d) --storage-class GLACIER
```

### Application Backups

**Code**: Git repository (version controlled)

**Configuration**:
- `.env` files encrypted and stored in secrets manager
- Docker images tagged and pushed to GHCR

## Recovery Procedures

### Database Recovery

**Point-in-Time Recovery (PITR)**:

1. **Stop Application**:
   ```bash
   kubectl scale deployment cms --replicas=0
   ```

2. **Restore Full Backup**:
   ```bash
   aws s3 cp s3://cms-backups/database/cms_FULL_DATE.sql.gz - | gunzip | mysql cms
   ```

3. **Apply Incremental Binlogs**:
   ```bash
   mysqlbinlog --start-datetime="2026-04-03 02:00:00" --stop-datetime="2026-04-03 14:30:00" /var/lib/mysql/mysql-bin.* | mysql cms
   ```

4. **Verify Data**:
   ```bash
   php artisan migrate --pretend
   php artisan db:seed --class=VerificationSeeder
   ```

5. **Restart Application**:
   ```bash
   kubectl scale deployment cms --replicas=3
   ```

### Application Recovery

1. **Pull Latest Image**:
   ```bash
   kubectl set image deployment/cms cms=ghcr.io/org/cms:latest
   ```

2. **Run Migrations**:
   ```bash
   kubectl exec deployment/cms -- php artisan migrate --force
   ```

3. **Clear Cache**:
   ```bash
   kubectl exec deployment/cms -- php artisan cache:clear
   kubectl exec deployment/cms -- php artisan config:clear
   ```

### Media Recovery (S3)

1. **List Available Backups**:
   ```bash
   aws s3 ls s3://cms-backups/media/
   ```

2. **Restore from Backup**:
   ```bash
   aws s3 sync s3://cms-backups/media/2026-04-03/ s3://cms-media/
   ```

3. **Verify Media Integrity**:
   ```bash
   php artisan media:verify
   ```

## Testing Backups

**Monthly Backup Verification** (automated via GitHub Actions):

```yaml
name: Backup Verification
on:
  schedule:
    - cron: '0 3 1 * *' # First day of month at 03:00

jobs:
  verify-backups:
    runs-on: ubuntu-latest
    steps:
      - name: Download Latest Backup
        run: aws s3 cp s3://cms-backups/database/latest.sql.gz .
      
      - name: Restore to Test Database
        run: |
          mysql -u test_user -p$TEST_DB_PASSWORD test_cms < latest.sql.gz
          
      - name: Verify Data Integrity
        run: |
          mysql -u test_user -p$TEST_DB_PASSWORD test_cms -e "
            SELECT COUNT(*) FROM users;
            SELECT COUNT(*) FROM products;
            SELECT COUNT(*) FROM orders;
          "
          
      - name: Alert on Failure
        if: failure()
        run: |
          curl -X POST $SLACK_WEBHOOK -d '{"text": "Backup verification failed"}'
```

## Monitoring & Alerting

**Backup Health Checks**:
- Prometheus: `backup_last_success_timestamp`
- Alert: If no successful backup in >24 hours

**Sentry Alerts**:
- Database connection failures
- Storage quota warnings
- Backup script errors

## Contact & Escalation

**Primary Contact**: DevOps Team (devops@example.com)

**Escalation Path**:
1. On-call engineer (15 min response)
2. Team lead (30 min response)
3. CTO (1 hour response)

**Incident Response**:
1. Acknowledge incident in Sentry/PagerDuty
2. Assess scope and impact
3. Execute recovery procedure
4. Document timeline and actions
5. Post-mortem within 48 hours

## Failover & Redundancy

**Database**:
- Primary: eu-central-1
- Read replica: eu-central-1b
- Failover: Automatic (RDS Multi-AZ)

**Application**:
- Primary cluster: eu-central-1 (3 replicas)
- CDN: Cloudflare (global)

**Redis**:
- Primary: eu-central-1
- Sentinel: 2 replicas

## Cost Optimization

**Backup Storage Costs**:
- S3 Standard: $0.023/GB
- S3 Glacier: $0.004/GB
- Cross-region replication: +$0.02/GB

**Estimated Monthly Cost**: $150-300 (depending on data size)

---

*Last Updated: 2026-04-03*
*Next Review: 2026-05-03*