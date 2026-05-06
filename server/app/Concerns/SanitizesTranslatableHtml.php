<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Services\HtmlSanitizerService;

/**
 * Sanitizes HTML for translatable model attributes before they are stored.
 * Requires the model to define `$htmlAttributes` array listing which fields need sanitization.
 *
 * Example:
 *   protected array $htmlAttributes = ['description', 'short_description'];
 */
trait SanitizesTranslatableHtml
{
    public function setTranslation(string $key, string $locale, mixed $value): static
    {
        if (
            is_string($value)
            && isset($this->htmlAttributes)
            && in_array($key, $this->htmlAttributes, true)
        ) {
            $value = app(HtmlSanitizerService::class)->sanitize($value);
        }

        return parent::setTranslation($key, $locale, $value);
    }
}
