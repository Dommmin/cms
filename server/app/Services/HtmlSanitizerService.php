<?php

declare(strict_types=1);

namespace App\Services;

use Mews\Purifier\Facades\Purifier;

/**
 * Single source of truth for HTML sanitization.
 * All HTML stored in the database must pass through one of these methods.
 */
class HtmlSanitizerService
{
    /**
     * Full RTE output — articles, blog posts, products, page rich_content.
     */
    public function sanitize(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        if (mb_trim($html) === '') {
            return $html;
        }

        return Purifier::clean($html, 'default');
    }

    /**
     * Basic inline formatting — short descriptions in page builder.
     */
    public function sanitizeBasic(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        if (mb_trim($html) === '') {
            return $html;
        }

        return Purifier::clean($html, 'basic');
    }

    /**
     * Sanitizes all string values in a nested array that match the given keys.
     * Used for page builder configuration blocks.
     *
     * @param  array<mixed>  $data
     * @param  list<string>  $richTextKeys  Keys whose values should be sanitized as full HTML.
     * @return array<mixed>
     */
    public function sanitizeArray(array $data, array $richTextKeys = []): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->sanitizeArray($value, $richTextKeys);
            } elseif (is_string($value) && in_array($key, $richTextKeys, true)) {
                $data[$key] = $this->sanitize($value);
            }
        }

        return $data;
    }
}
