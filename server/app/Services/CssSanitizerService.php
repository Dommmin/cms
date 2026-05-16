<?php

declare(strict_types=1);

namespace App\Services;

class CssSanitizerService
{
    public const int MAX_CSS_BYTES = 32_768;

    public function sanitize(?string $css): ?string
    {
        if ($css === null || mb_trim($css) === '') {
            return $css;
        }

        $css = str_ireplace('</style', '', $css);

        $css = preg_replace('/@import\s+[^;]+;?/i', '', $css) ?? '';
        $css = preg_replace('/expression\s*\([^)]*\)/i', '', $css) ?? '';
        $css = preg_replace('/url\s*\(\s*([\'"]?)\s*(javascript|vbscript):.*?\1\s*\)/i', 'url(about:blank)', $css) ?? '';
        $css = preg_replace('/url\s*\(\s*([\'"]?)\s*data:(?!image\/(?:png|gif|jpeg|jpg|webp|svg\+xml);base64,).*?\1\s*\)/i', 'url(about:blank)', $css) ?? '';
        $css = preg_replace('/(?<![a-z0-9_-])(javascript|vbscript):/i', '', $css) ?? '';

        return mb_substr($css, 0, self::MAX_CSS_BYTES);
    }
}
