<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Services\HtmlSanitizerService;

/**
 * Sanitizes HTML for translatable model attributes before they are stored.
 *
 * Uses Eloquent's boot hook (creating/updating) to sanitize all translations
 * for keys listed in `$htmlAttributes` — no setTranslation() conflict with
 * Spatie HasTranslations.
 *
 * Usage: declare in your model class (not the trait):
 *   protected array $htmlAttributes = ['description', 'short_description'];
 */
trait SanitizesTranslatableHtml
{
    public static function bootSanitizesTranslatableHtml(): void
    {
        $sanitize = static function (self $model): void {
            $sanitizer = resolve(HtmlSanitizerService::class);

            foreach ($model->htmlAttributes as $attribute) {
                /** @var array<string, mixed> $translations */
                $translations = $model->getTranslations($attribute);
                $dirty = false;

                foreach ($translations as $locale => $value) {
                    if (is_string($value)) {
                        $clean = $sanitizer->sanitize($value);
                        if ($clean !== $value) {
                            $translations[$locale] = $clean;
                            $dirty = true;
                        }
                    }
                }

                if ($dirty) {
                    $model->setTranslations($attribute, $translations);
                }
            }
        };

        static::creating($sanitize);
        static::updating($sanitize);
    }
}
