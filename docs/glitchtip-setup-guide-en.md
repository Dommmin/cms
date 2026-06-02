# Error Tracking with GlitchTip on k3s — Complete Deployment & Integration Guide

> **Level:** Intermediate · **Prerequisites:** Running k3s cluster, basic kubectl knowledge, Laravel 11/12, Next.js  
> **Reading Time:** ~15 min · **Deployment Time:** ~20 min  

---

When deploying production applications, getting instant alerts about errors (Exception 500) encountered by users is crucial. While standard logs are sent to `stderr` and can be inspected via `kubectl logs`, manually scanning text logs is highly inefficient.

In our project, we integrated **GlitchTip** — a fully open-source, Sentry-compatible alternative hosted locally inside our k3s Kubernetes cluster. This guide details our architecture, application integration, and how we solved SSL certificate issues within the internal cluster network.

---

## Table of Contents

1. [Why GlitchTip?](#1-why-glitchtip)
2. [Cluster Deployment Architecture](#2-cluster-deployment-architecture)
3. [Laravel API Integration (Backend)](#3-laravel-api-integration-backend)
   - [3.1 Sentry SDK Configuration](#31-sentry-sdk-configuration)
   - [3.2 Exception Handler Registration in Laravel 11/12](#32-exception-handler-registration-in-laravel-1112)
   - [3.3 Bonus: SSL Verification Toggle Option](#33-bonus-ssl-verification-toggle-option)
4. [The Crucial Step: Internal Microservices Routing (Bypass SSL)](#4-the-crucial-step-internal-microservices-routing-bypass-ssl)
5. [Next.js Storefront Integration (Frontend)](#5-nextjs-storefront-integration-frontend)
6. [Clearing Production Configuration Cache and OPcache](#6-clearing-production-configuration-cache-and-opcache)
7. [Verifying the Integration (Tests)](#7-verifying-the-integration-tests)

---

## 1. Why GlitchTip?

*   **100% Sentry Compatible:** We use official `@sentry/nextjs` and `sentry/sentry-laravel` SDKs. Migrating from Sentry to GlitchTip only requires replacing the `DSN` URL in the `.env` file.
*   **Self-Hosted & GDPR Compliant:** All logs, IP addresses, and user-related details never leave our secure cluster.
*   **No Event Limits:** We are only limited by server disk space and database resources on our VPS.

---

## 2. Cluster Deployment Architecture

GlitchTip runs in a dedicated namespace called `glitchtip` and consists of three main components:

```
Client (Browser)
       │ (HTTPS)
       ▼
  [ Ingress ] ──► glitchtip-web (Port 80/443) ──► glitchtip-valkey (Redis)
                                │
                                └──► glitchtip-postgresql (Database)
```

Inside the k3s cluster, services communicate using internal Kubernetes DNS names:
*   Database: `glitchtip-postgresql.glitchtip.svc.cluster.local:5432`
*   Cache/Queue (Valkey): `glitchtip-valkey.glitchtip.svc.cluster.local:6379`
*   GlitchTip Web Server: `glitchtip-web.glitchtip.svc.cluster.local:80`

For external access (e.g. client browser reporting errors from the Next.js storefront), we define a Traefik Ingress with an SSL certificate:
*   External URL: `https://glitchtip.laravel-test.shop`

---

## 3. Laravel API Integration (Backend)

We installed the `sentry/sentry-laravel` package on our backend. To ensure exceptions are properly logged, we applied three key modifications.

### 3.1 Sentry SDK Configuration

In [config/sentry.php](file:///Users/domin/projects/laravel/cms/server/config/sentry.php), we updated environmental variable priorities, prioritizing `GLITCHTIP` variables over standard `SENTRY` fallbacks:

```php
return [
    'dsn' => env('GLITCHTIP_DSN', env('SENTRY_LARAVEL_DSN')),
    'http_ssl_verify_peer' => (bool) env('GLITCHTIP_HTTP_SSL_VERIFY', env('SENTRY_HTTP_SSL_VERIFY', true)),
    'environment' => env('APP_ENV', 'production'),
    // ... rest of the configuration
];
```

### 3.2 Exception Handler Registration in Laravel 11/12

In Laravel 11/12, global exception handling is configured in [bootstrap/app.php](file:///Users/domin/projects/laravel/cms/server/bootstrap/app.php) instead of the old `Handler.php` class. We registered the Sentry handler inside `withExceptions`:

```php
->withExceptions(function (Exceptions $exceptions): void {
    // This line registers the Sentry SDK to forward uncaught exceptions
    \Sentry\Laravel\Integration::handles($exceptions);

    // Custom HTTP renderings:
    $exceptions->render(function (AuthenticationException $e, Request $request) {
        ...
    });
})
```

### 3.3 Bonus: SSL Verification Toggle Option

In local development or sandboxed staging environments, our GlitchTip instance might use a self-signed SSL certificate (such as the default Traefik certificate: `CN=TRAEFIK DEFAULT CERT`). By default, Guzzle/cURL inside PHP will block these connections with an error:
`cURL Error (60) SSL: unable to get local issuer certificate`.

By mapping `'http_ssl_verify'`, we can disable SSL verification in development by setting:
```env
GLITCHTIP_HTTP_SSL_VERIFY=false
```

---

## 4. The Crucial Step: Internal Microservices Routing (Bypass SSL)

The cleanest and most robust way to solve SSL validation issues inside the cluster is to **bypass SSL entirely by routing internal backend traffic over HTTP directly within the Kubernetes network**.

Since our Laravel backend and GlitchTip are running inside the same physical cluster, we modified the `GLITCHTIP_DSN` inside the Kubernetes secret `app-server-env`:

*   **Instead of (Public HTTPS):**
    `GLITCHTIP_DSN=https://key@glitchtip.laravel-test.shop/1`
*   **We used (Internal Cluster HTTP):**
    `GLITCHTIP_DSN=http://key@glitchtip-web.glitchtip.svc.cluster.local/1`

### Why this is a best practice:
1.  **SSL Bypass:** Since communication happens over standard HTTP (Port 80) inside the isolated Kubernetes virtual network, we entirely skip TLS handshakes, preventing any `cURL Error 60` certificate mismatches.
2.  **Ultra-High Performance:** Requests bypass external load balancers, DNS resolvers, and firewalls. Networking packets are routed directly at the virtual network interface level between pods, reducing latency significantly.

---

## 5. Next.js Storefront Integration (Frontend)

Because frontend browser code is executed on the client's device outside the cluster, **it must communicate with GlitchTip via the public HTTPS endpoint**.

Our Next.js setup uses:
*   [sentry.client.config.ts](file:///Users/domin/projects/laravel/cms/client/sentry.client.config.ts) – handles browser-side exceptions.
*   [sentry.server.config.ts](file:///Users/domin/projects/laravel/cms/client/sentry.server.config.ts) – handles SSR and Node.js API Route errors.
*   [sentry.edge.config.ts](file:///Users/domin/projects/laravel/cms/client/sentry.edge.config.ts) – handles Edge middleware exceptions.

We supply the **public DSN** to the frontend `.env` configuration:
```env
NEXT_PUBLIC_GLITCHTIP_DSN=https://key-frontend@glitchtip.laravel-test.shop/2
```

---

## 6. Clearing Production Configuration Cache and OPcache

When manually hot-patching configurations inside a running production pod (e.g. using `kubectl cp`), PHP-FPM might keep serving old compiled files due to **OPcache**.

To force PHP to reload configuration files without restarting the entire pod, clear the framework cache and reload the PHP-FPM process:

```bash
# Clear Laravel caches
kubectl -n app exec deploy/app-server -- php artisan config:clear
kubectl -n app exec deploy/app-server -- php artisan route:clear

# Signal PHP-FPM to reload (assuming master process is PID 20)
kubectl -n app exec deploy/app-server -- kill -USR2 20
```

---

## 7. Verifying the Integration (Tests)

To ensure backend exceptions are successfully forwarded to GlitchTip, trigger Sentry's built-in test command inside the server pod:

```bash
kubectl -n app exec deploy/app-server -- php artisan sentry:test
```

A successful output should display:
```
DSN discovered from Laravel config or `.env` file!
Sending test event...
Test event sent with ID: d5d06e4f24ff4e9188a083c0439e6850
```

Once this is complete, open your GlitchTip dashboard. The test error will be displayed instantly inside the **Issues** section. You have now established a complete stability monitoring system!
