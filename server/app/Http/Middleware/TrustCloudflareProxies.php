<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Reads the real client IP from the CF-Connecting-IP header set by Cloudflare.
 *
 * Must be registered as the first middleware so that $request->ip() returns the
 * real user IP in all downstream middleware (rate limiters, logging, etc.).
 *
 * Security note: in production, only accept CF-Connecting-IP headers that
 * originate from Cloudflare's official IP ranges.
 */
class TrustCloudflareProxies
{
    private const array CLOUDFLARE_IPS = [
        // IPv4
        '173.245.48.0/20',
        '103.21.244.0/22',
        '103.22.200.0/22',
        '103.31.4.0/22',
        '141.101.64.0/18',
        '108.162.192.0/18',
        '190.93.240.0/20',
        '188.114.96.0/20',
        '197.234.240.0/22',
        '198.41.128.0/17',
        '162.158.0.0/15',
        '104.16.0.0/13',
        '104.24.0.0/14',
        '172.64.0.0/13',
        '131.0.72.0/22',
        // IPv6
        '2400:cb00::/32',
        '2606:4700::/32',
        '2803:f800::/32',
        '2405:b500::/32',
        '2405:8100::/32',
        '2a06:98c0::/29',
        '2c0f:f248::/32',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $remoteAddr = $request->server->get('REMOTE_ADDR');
        $cfIp = $request->header('CF-Connecting-IP');

        if ($cfIp && $remoteAddr && $this->isTrustedProxy($remoteAddr) && filter_var($cfIp, FILTER_VALIDATE_IP)) {
            $request->server->set('REMOTE_ADDR', $cfIp);
        }

        return $next($request);
    }

    private function isTrustedProxy(string $ip): bool
    {
        if (app()->environment('local', 'testing') && ($ip === '127.0.0.1' || $ip === '::1' || str_starts_with($ip, '172.') || str_starts_with($ip, '192.168.') || str_starts_with($ip, '10.'))) {
            return true;
        }

        return array_any(self::CLOUDFLARE_IPS, fn (string $range): bool => $this->ipInCidr($ip, $range));
    }

    private function ipInCidr(string $ip, string $cidr): bool
    {
        $parts = explode('/', $cidr, 2);
        if (count($parts) !== 2) {
            return false;
        }

        [$network, $prefix] = $parts;

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) &&
            filter_var($network, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $ipLong = ip2long($ip);
            $networkLong = ip2long($network);
            $mask = ~((1 << (32 - (int) $prefix)) - 1);

            return ($ipLong & $mask) === ($networkLong & $mask);
        }

        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) &&
            filter_var($network, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $ipBinary = inet_pton($ip);
            $networkBinary = inet_pton($network);
            if ($ipBinary === false || $networkBinary === false) {
                return false;
            }

            $ipBits = '';
            for ($i = 0; $i < 16; $i++) {
                $ipBits .= mb_str_pad(decbin(ord($ipBinary[$i])), 8, '0', STR_PAD_LEFT);
            }

            $networkBits = '';
            for ($i = 0; $i < 16; $i++) {
                $networkBits .= mb_str_pad(decbin(ord($networkBinary[$i])), 8, '0', STR_PAD_LEFT);
            }

            return mb_substr($ipBits, 0, (int) $prefix) === mb_substr($networkBits, 0, (int) $prefix);
        }

        return false;
    }
}
