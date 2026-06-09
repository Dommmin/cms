<?php

declare(strict_types=1);

namespace App\Services;

final class OutboundWebhookPolicy
{
    public static function violationFor(string $url): ?string
    {
        $parts = parse_url($url);

        if (! is_array($parts)) {
            return 'Webhook URL is invalid.';
        }

        $scheme = mb_strtolower((string) ($parts['scheme'] ?? ''));
        $host = mb_strtolower((string) ($parts['host'] ?? ''));

        if ($host === '') {
            return 'Webhook URL must include a host.';
        }

        if (self::requiresHttps() && $scheme !== 'https' && ! self::allowsLocalHttpHost($host, $scheme)) {
            return 'Webhook URL must use HTTPS.';
        }

        if (self::isBlockedHost($host)) {
            return 'Webhook URL must target a public endpoint.';
        }

        return null;
    }

    private static function requiresHttps(): bool
    {
        return (bool) config('security.outbound_webhooks.require_https', true);
    }

    private static function allowsLocalHttpHost(string $host, string $scheme): bool
    {
        /** @var array<int, string> $allowedLocalHosts */
        $allowedLocalHosts = config('security.outbound_webhooks.allowed_local_hosts', []);

        return $scheme === 'http'
            && (bool) config('security.outbound_webhooks.allow_local_targets', false)
            && in_array($host, $allowedLocalHosts, true);
    }

    private static function isBlockedHost(string $host): bool
    {
        /** @var array<int, string> $allowedLocalHosts */
        $allowedLocalHosts = config('security.outbound_webhooks.allowed_local_hosts', []);

        if ((bool) config('security.outbound_webhooks.allow_local_targets', false)
            && in_array($host, $allowedLocalHosts, true)) {
            return false;
        }

        /** @var array<int, string> $blockedHostSuffixes */
        $blockedHostSuffixes = config('security.outbound_webhooks.blocked_host_suffixes', []);

        foreach ($blockedHostSuffixes as $suffix) {
            if (str_ends_with($host, (string) $suffix)) {
                return true;
            }
        }

        if (! filter_var($host, FILTER_VALIDATE_IP)) {
            return false;
        }

        return ! filter_var(
            $host,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        );
    }
}
