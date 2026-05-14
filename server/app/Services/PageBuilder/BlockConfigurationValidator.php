<?php

declare(strict_types=1);

namespace App\Services\PageBuilder;

use App\Services\HtmlSanitizerService;
use Illuminate\Validation\ValidationException;

class BlockConfigurationValidator
{
    private const int MAX_CONFIG_BYTES = 65_536;

    public function __construct(
        private readonly HtmlSanitizerService $htmlSanitizer,
    ) {}

    /**
     * @param  array<string, mixed>|null  $configuration
     * @return array<string, mixed>
     *
     * @throws ValidationException
     */
    public function validateAndSanitize(string $blockType, ?array $configuration, string $attribute): array
    {
        $configuration ??= [];
        $errors = [];

        $encoded = json_encode($configuration);
        if ($encoded === false || mb_strlen($encoded) > self::MAX_CONFIG_BYTES) {
            throw ValidationException::withMessages([
                $attribute => 'The '.$attribute.' must not exceed 64KB.',
            ]);
        }

        $blockConfig = config('blocks.block_types.'.$blockType);
        if (! is_array($blockConfig)) {
            throw ValidationException::withMessages([
                $attribute => 'The selected block type is invalid.',
            ]);
        }

        $schema = $blockConfig['schema'] ?? ['type' => 'object', 'properties' => []];
        $sanitized = $this->validateObject($configuration, $schema, $attribute, $errors, $blockType);

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }

        return $sanitized;
    }

    /**
     * @param  array<string, mixed>  $value
     * @param  array<string, mixed>  $schema
     * @param  array<string, list<string>>  $errors
     * @return array<string, mixed>
     */
    private function validateObject(array $value, array $schema, string $attribute, array &$errors, ?string $blockType = null): array
    {
        $properties = $schema['properties'] ?? [];

        if (! is_array($properties)) {
            return $value;
        }

        foreach ($value as $key => $fieldValue) {
            if (! array_key_exists($key, $properties)) {
                $errors[$attribute.'.'.$key][] = 'The '.$attribute.'.'.$key.' field is not allowed for this block type.';

                continue;
            }

            if (! is_array($properties[$key])) {
                continue;
            }

            $value[$key] = $this->validateValue($fieldValue, $properties[$key], $attribute.'.'.$key, $errors, $blockType);
        }

        foreach ($properties as $key => $property) {
            if (is_array($property) && ($property['required'] ?? false) === true && ! array_key_exists($key, $value)) {
                $errors[$attribute.'.'.$key][] = 'The '.$attribute.'.'.$key.' field is required.';
            }
        }

        return $value;
    }

    /**
     * @param  array<string, mixed>  $schema
     * @param  array<string, list<string>>  $errors
     */
    private function validateValue(mixed $value, array $schema, string $attribute, array &$errors, ?string $blockType): mixed
    {
        if ($value === null || $value === '') {
            return $value;
        }

        $type = $schema['type'] ?? 'string';

        match ($type) {
            'string' => $this->validateString($value, $schema, $attribute, $errors, $blockType),
            'integer' => $this->validateInteger($value, $schema, $attribute, $errors),
            'number' => $this->validateNumber($value, $schema, $attribute, $errors),
            'boolean' => $this->validateBoolean($value, $attribute, $errors),
            'array' => $value = $this->validateArray($value, $schema, $attribute, $errors, $blockType),
            'object' => $value = $this->validateObjectValue($value, $schema, $attribute, $errors, $blockType),
            default => null,
        };

        if (is_string($value) && $this->shouldSanitizeHtml($schema, $attribute, $blockType)) {
            return $this->htmlSanitizer->sanitize($value);
        }

        return $value;
    }

    /**
     * @param  array<string, mixed>  $schema
     * @param  array<string, list<string>>  $errors
     */
    private function validateString(mixed $value, array $schema, string $attribute, array &$errors, ?string $blockType): void
    {
        if (! is_string($value)) {
            $errors[$attribute][] = 'The '.$attribute.' field must be a string.';

            return;
        }

        if (isset($schema['maxLength']) && mb_strlen($value) > (int) $schema['maxLength']) {
            $errors[$attribute][] = 'The '.$attribute.' field must not be greater than '.$schema['maxLength'].' characters.';
        }

        if (isset($schema['enum']) && is_array($schema['enum']) && ! in_array($value, $schema['enum'], true)) {
            $errors[$attribute][] = 'The selected '.$attribute.' is invalid.';
        }

        $format = $schema['format'] ?? null;
        if ($format === 'url' && ! $this->isAllowedUrl($value)) {
            $errors[$attribute][] = 'The '.$attribute.' field must be a valid URL, relative path, email link, phone link, or anchor.';
        }

        if ($format === 'email' && filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            $errors[$attribute][] = 'The '.$attribute.' field must be a valid email address.';
        }

        if ($format === 'color' && preg_match('/^#(?:[0-9a-fA-F]{3}){1,2}$/', $value) !== 1) {
            $errors[$attribute][] = 'The '.$attribute.' field must be a valid hex color.';
        }
    }

    /**
     * @param  array<string, mixed>  $schema
     * @param  array<string, list<string>>  $errors
     */
    private function validateInteger(mixed $value, array $schema, string $attribute, array &$errors): void
    {
        if (! is_int($value)) {
            $errors[$attribute][] = 'The '.$attribute.' field must be an integer.';

            return;
        }

        $this->validateMinMax($value, $schema, $attribute, $errors);
    }

    /**
     * @param  array<string, mixed>  $schema
     * @param  array<string, list<string>>  $errors
     */
    private function validateNumber(mixed $value, array $schema, string $attribute, array &$errors): void
    {
        if (! is_int($value) && ! is_float($value)) {
            $errors[$attribute][] = 'The '.$attribute.' field must be a number.';

            return;
        }

        $this->validateMinMax($value, $schema, $attribute, $errors);
    }

    /**
     * @param  array<string, list<string>>  $errors
     */
    private function validateBoolean(mixed $value, string $attribute, array &$errors): void
    {
        if (! is_bool($value)) {
            $errors[$attribute][] = 'The '.$attribute.' field must be true or false.';
        }
    }

    /**
     * @param  array<string, mixed>  $schema
     * @param  array<string, list<string>>  $errors
     */
    private function validateArray(mixed $value, array $schema, string $attribute, array &$errors, ?string $blockType): mixed
    {
        if (! is_array($value)) {
            $errors[$attribute][] = 'The '.$attribute.' field must be an array.';

            return $value;
        }

        $itemSchema = $schema['items'] ?? null;
        if (! is_array($itemSchema)) {
            return $value;
        }

        foreach ($value as $index => $item) {
            $itemAttribute = $attribute.'.'.$index;

            if (($itemSchema['type'] ?? null) === 'object') {
                if (! is_array($item)) {
                    $errors[$itemAttribute][] = 'The '.$itemAttribute.' field must be an object.';

                    continue;
                }

                $value[$index] = $this->validateObject($item, $itemSchema, $itemAttribute, $errors, $blockType);

                continue;
            }

            $value[$index] = $this->validateValue($item, $itemSchema, $itemAttribute, $errors, $blockType);
        }

        return $value;
    }

    /**
     * @param  array<string, mixed>  $schema
     * @param  array<string, list<string>>  $errors
     */
    private function validateObjectValue(mixed $value, array $schema, string $attribute, array &$errors, ?string $blockType): mixed
    {
        if (! is_array($value)) {
            $errors[$attribute][] = 'The '.$attribute.' field must be an object.';

            return $value;
        }

        return $this->validateObject($value, $schema, $attribute, $errors, $blockType);
    }

    /**
     * @param  array<string, mixed>  $schema
     * @param  array<string, list<string>>  $errors
     */
    private function validateMinMax(int|float $value, array $schema, string $attribute, array &$errors): void
    {
        if (isset($schema['min']) && $value < (int) $schema['min']) {
            $errors[$attribute][] = 'The '.$attribute.' field must be at least '.$schema['min'].'.';
        }

        if (isset($schema['max']) && $value > (int) $schema['max']) {
            $errors[$attribute][] = 'The '.$attribute.' field must not be greater than '.$schema['max'].'.';
        }
    }

    /**
     * Accept public URLs and the internal link forms used by the editor.
     */
    private function isAllowedUrl(string $value): bool
    {
        if (preg_match('/^(https?:\/\/|mailto:|tel:|\/|#)/i', $value) !== 1) {
            return false;
        }

        return preg_match('/^\s*(javascript|vbscript|data):/i', $value) !== 1;
    }

    /**
     * @param  array<string, mixed>  $schema
     */
    private function shouldSanitizeHtml(array $schema, string $attribute, ?string $blockType): bool
    {
        $format = $schema['format'] ?? null;

        if (in_array($format, ['richtext', 'html'], true)) {
            return true;
        }

        return $blockType === 'custom_html' && str_ends_with($attribute, '.html');
    }
}
