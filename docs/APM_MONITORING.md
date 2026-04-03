# APM Monitoring Setup

## Datadog Integration

### Installation

```bash
composer require datadog/dd-trace
```

### Configuration

Add to `.env`:

```env
DD_AGENT_HOST=datadog-agent
DD_TRACE_AGENT_PORT=8126
DD_ENV=production
DD_SERVICE=cms
DD_VERSION=1.0.0
```

### Kubernetes Setup

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cms
spec:
  template:
    spec:
      containers:
        - name: cms
          env:
            - name: DD_AGENT_HOST
              valueFrom:
                fieldRef:
                  fieldPath: status.hostIP
```

### Key Metrics to Monitor

1. **Response Time**: p50, p95, p99 latency
2. **Error Rate**: HTTP 5xx, exceptions
3. **Database**: Query time, connections
4. **Queue**: Job processing time, failures
5. **Memory**: PHP-FPM memory usage
6. **CPU**: Container CPU %

### Alerts Configuration

```yaml
# Datadog Monitor: High Error Rate
name: CMS High Error Rate
type: metric alert
query: sum:php.errors{$env} > 100
message: |
  CMS is experiencing high error rate
  @pagerduty-team-cms

# Datadog Monitor: Slow Queries  
name: CMS Slow Database Queries
type: metric alert
query: avg:php.db.query_time{$env} > 1000
message: |
  Database queries are slow (>1s)
  @slack-alerts
```

### Dashboards

**Performance Dashboard**:
- Request latency distribution
- Throughput (requests/min)
- Error rate %
- Database query performance
- Cache hit ratio

**Business Metrics Dashboard**:
- Orders per hour
- Checkout conversion rate
- Payment success rate
- Cart abandonment %

## Alternative: New Relic

```bash
composer require newrelic/newrelic-php-daemon
```

Configuration similar to Datadog with New Relic-specific agent settings.
