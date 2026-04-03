# Uptime Monitoring — Production Setup

> **Status:** Documentation ready  
> **Last updated:** 2026-04-03  
> **Priority:** P0 (Critical — must be configured before production)

---

## Overview

This document describes the recommended uptime monitoring setup forproduction using external services like UptimeRobot, Pingdom, or Cloudflare Health Checks.

---

## 1. Recommended Monitoring Services

### Primary Options (choose one):

| Service | Free Tier | Pro Features | Recommended For |
|---------|-----------|--------------|-----------------|
| **UptimeRobot** | 50 monitors, 5-min intervals | 1-min intervals, SMS alerts | Small-medium projects |
| **Pingdom** | 1 monitor, granular checks | Multiple locations, RUM | Enterprise projects |
| **Cloudflare Health Checks** | Unlimited monitors | Integrated with CF network | Cloudflare-proxied sites |

### Recommended Stack:
1. **UptimeRobot** (free) — basic uptime + SSL expiry monitoring
2. **Cloudflare Health Checks** (if using CF proxy) — detailed health checks
3. **Sentry** (already configured) — error tracking + alerting

---

## 2. Critical Endpoints to Monitor

### 2.1 Health Check Endpoints

The application uses `spatie/laravel-health` with `/up` endpoint.

**Endpoints:**

| Endpoint | Purpose | Expected Response |
|----------|---------|-------------------|
| `/up` | Laravel health check | 200 OK |
| `/api/v1/health` | API health check (custom) | 200 OK with JSON |

### 2.2 Public Endpoints

| Endpoint | Purpose | Check Frequency |
|----------|---------|-----------------|
| `/` | Homepage uptime | Every 5 min |
| `/products` | Product listing | Every 5 min |
| `/api/v1/products` | API availability | Every 5 min |
| `/login` | Auth pages | Every 10 min |

### 2.3 Background Jobs

Monitor queue workers via Laravel Horizon or custom health check:

```php
// Add to config/health.php
use Spatie\Health\Checks\Checks\QueueCheck;
use Spatie\Health\Checks\Checks\DatabaseCheck;
use Spatie\Health\Checks\Checks\RedisCheck;
use Spatie\Health\Checks\Checks\ScheduleCheck;

Health::checks([
    DatabaseCheck::new(),
    RedisCheck::new(),
    QueueCheck::new()->onQueue(['default', 'high', 'low']),
    ScheduleCheck::new(),
]);
```

---

## 3. UptimeRobot Configuration

### 3.1 Account Setup

1. Create account at https://uptimerobot.com
2. Add email notifications
3. Configure Slack/Discord webhook (optional)

### 3.2Monitor Setup

**HTTP Monitor:**

```yaml
Monitor Type: HTTP(s)
Friendly Name: CMS Production - Homepage
URL: https://yourdomain.com/
Monitoring Interval: 5 minutes
Timeout: 30 seconds

Alerts to:
  - Email: ops-team@example.com
  - Slack: #alerts channel
```

**SSL Monitor:**

```yaml
Monitor Type: HTTPS (SSL)
Friendly Name: CMS Production - SSL Certificate
URL: https://yourdomain.com/
Alert Before Expiry: 14 days
```

**API Health Monitor:**

```yaml
Monitor Type: HTTP(s)
Friendly Name: CMS Production - API Health
URL: https://yourdomain.com/api/v1/health
Monitoring Interval: 5 minutes
Expected Status Code: 200
Expected Keyword: "status":"ok"
```

### 3.3 Integration with Laravel

Add UptimeRobot webhook to Laravel:

```php
// routes/web.php
Route::post('/webhook/uptimerobot', [\App\Http\Controllers\WebhookController::class, 'uptimeRobot']);

// app/Http/Controllers/WebhookController.php
public function uptimeRobot(Request $request)
{
    $monitorName = $request->input('monitor_name');
    $status = $request->input('status'); // 'down' or 'up'
    
    // Log to Sentry
    if ($status === 'down') {
        \Sentry\captureMessage("Uptime alert: {$monitorName} is DOWN");
    }
    
    // Notify Slack
    // ...
    
    return response()->json(['status' => 'ok']);
}
```

---

## 4. Cloudflare Health Checks (Recommended)

If using Cloudflare as proxy:

### 4.1 Configuration

```bash
# Via Cloudflare Dashboard or API
curl -X POST "https://api.cloudflare.com/client/v4/user/load_balancers/pools/health_checks" \
  -H "X-Auth-Email:your-email@example.com" \
  -H "X-Auth-Key: your-cloudflare-api-key" \
  -H "Content-Type: application/json" \
  --data '{
    "description": "CMS Production Health Check",
    "interval": 60,
    "retries": 2,
    "timeout": 10,
    "checkIntervalInSeconds": 60,
    "expectedCodes": [200],
    "expectedBody": "status",
    "path": "/up",
    "header": {},
    "method": "GET"
  }'
```

### 4.2 Policy

```json
{
  "description": "CMS production health policy",
  "execute": [
    {
      "type": "pool",
      "pool_id": "your-pool-id",
      "origin_id": "your-origin-id"
    }
  ]
}
```

### 4.3 Monitoring Dashboard

- Cloudflare Dashboard > Traffic > Load Balancing > Health Checks
- Real-time status
- Historical uptime data
- Response time graphs

---

## 5. Pingdom Integration (Alternative)

### 5.Pingdom Check Configuration

```bash
curl -X POST "https://api.pingdom.com/api/3.1/checks" \
  -H "Authorization: Bearer YOUR_PINGDOM_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "name": "CMS Production - Homepage",
    "host": "yourdomain.com",
    "type": "http",
    "resolution": 5,
    "sendtoemail": true,
    "sendtosms": true,
    "notifyagainevery": 60
  }'
```

---

## 6. Alert Integration with Sentry

Configure Sentry to send alerts on downtime:

```php
// config/sentry.php
'integrations' => [
    \Sentry\Laravel\Integration::class,
],

// Custom alert handler
// app/Exceptions/UptimeAlertHandler.php
<?php

namespace App\Exceptions;

use Sentry\Laravel\Facades\Sentry;

class UptimeAlertHandler
{
    public static function handleDown(string $endpoint, string $error): void
    {
        Sentry::captureMessage("Uptime Alert: {$endpoint} DOWN", [
            'level' => 'error',
            'extra' => [
                'endpoint' => $endpoint,
                'error' => $error,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
        
        // Notify Slack/Discord
        // ...
    }
}
```

---

## 7. Status Page (Optional)

Create apublic status page using:

- **UptimeRobot Status Page** (free)
- **Statuspal** (paid)
- **Custom Laravel page**

**Example: `/status` route**

```php
// app/Http/Controllers/StatusController.php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Spatie\Health\Enums\Status;
use Spatie\Health\Facades\Health;

class StatusController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $health = Health::checkResults();
        
        $allOk = $health->status === Status::OK;
        
        return response()->json([
            'status' => $allOk ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'checks' => $health->toArray(),
        ], $allOk ? 200 : 503);
    }
}
```

---

## 8. Implementation Checklist

- [ ] Choose monitoring service (UptimeRobot/Pingdom/Cloudflare)
- [ ] Create account and configure alerts
- [ ] Add monitors for all critical endpoints
- [ ] Configure SSL certificate expiry alerts
- [ ] Set up webhook integration with Laravel
- [ ] Add Sentry alerts for downtime
- [ ] Create `/status` Health check endpoint
- [ ] Document incident response procedure
- [ ] Schedule quarterly uptime reviews
- [ ] Set up escalation policy (who gets notified when)

---

## 9. Incident Response Procedure

### When Alert Received:

1. **Acknowledge** — Mark incident in monitoring dashboard
2. **Investigate** — Check Laravel logs, Sentry, database, queue workers
3. **Communicate** — Update status page, notify stakeholders
4. **Resolve** — Fix issue, verify all checks pass
5. **Postmortem** — Document root cause, create preventive measures

### Escalation Path:

| Time | Action |
|------|--------|
| 0-5 min | Auto-alert to on-call DevOps |
| 5-15 min | Escalate to senior DevOps |
| 15-30 min | Escalate to CTO |
| 30+ min | Escalate to CEO |

---

## 10. Cost Estimation

| Service | Free Tier | Pro Plan | Notes |
|---------|-----------|----------|-------|
| UptimeRobot | 50 monitors | $7/month (50 monitors, 1-min intervals) | Recommended for start |
| Pingdom | 1 monitor | $10/month per check | Enterprise features |
| Cloudflare Health Checks | Unlimited | ~$5/month (included in PRO) | If already using Cloudflare |
| Sentry (alerts) | 5K events/day | $26/month | Already configured |

**Recommended:** Start with UptimeRobot free tier + Sentry alerts (~$0-33/month)

---

## References

- [UptimeRobot API Docs](https://uptimerobot.com/api/)
- [Cloudflare Health Checks](https://developers.cloudflare.com/load-balancing/monitoring/create-health-checks/)
- [Pingdom API Documentation](https://docs.pingdom.com/api/)
- [Spatie Laravel Health](https://spatie.be/docs/laravel-health)