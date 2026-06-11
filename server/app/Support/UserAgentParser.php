<?php

declare(strict_types=1);

namespace App\Support;

class UserAgentParser
{
    /**
     * Parse the user agent string into browser and platform details.
     *
     * @return array{browser: string, platform: string, device: string}
     */
    public static function parse(string $userAgent): array
    {
        $browser = 'Unknown Browser';
        $platform = 'Unknown Platform';

        // Detect platform
        if (preg_match('/windows|win32/i', $userAgent)) {
            $platform = 'Windows';
        } elseif (preg_match('/macintosh|mac os x/i', $userAgent)) {
            $platform = 'macOS';
        } elseif (preg_match('/linux/i', $userAgent)) {
            $platform = 'Linux';
        } elseif (preg_match('/iphone|ipad|ipod/i', $userAgent)) {
            $platform = 'iOS';
        } elseif (preg_match('/android/i', $userAgent)) {
            $platform = 'Android';
        }

        // Detect browser
        if (preg_match('/chrome/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/safari/i', $userAgent) && ! preg_match('/chrome/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/firefox/i', $userAgent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/msie|trident/i', $userAgent)) {
            $browser = 'Internet Explorer';
        } elseif (preg_match('/edge/i', $userAgent)) {
            $browser = 'Edge';
        }

        return [
            'browser' => $browser,
            'platform' => $platform,
            'device' => sprintf('%s on %s', $browser, $platform),
        ];
    }
}
