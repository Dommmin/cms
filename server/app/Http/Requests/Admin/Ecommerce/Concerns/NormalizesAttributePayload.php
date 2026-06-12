<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce\Concerns;

use App\Enums\AttributeTypeEnum;
use Illuminate\Support\Str;

trait NormalizesAttributePayload
{
    protected function normalizeAttributePayload(): void
    {
        $name = (string) ($this->input('name') ?? '');
        $type = $this->normalizeAttributeType($this->input('type'));
        $values = $this->normalizeAttributeValues($this->input('values', []));

        $this->merge([
            'slug' => $this->filled('slug') ? Str::slug((string) $this->input('slug')) : Str::slug($name),
            'type' => $type,
            'position' => $this->filled('position') ? (int) $this->input('position') : null,
            'values' => $values,
        ]);
    }

    private function normalizeAttributeType(mixed $type): string
    {
        $resolvedType = is_string($type) ? mb_strtolower($type) : '';

        return $resolvedType === 'number'
            ? AttributeTypeEnum::NUMERIC->value
            : $resolvedType;
    }

    /**
     * @param  mixed  $values
     * @return array<int, array<string, mixed>>
     */
    private function normalizeAttributeValues(mixed $values): array
    {
        if (! is_array($values)) {
            return [];
        }

        return collect($values)
            ->filter(fn (mixed $value): bool => is_array($value))
            ->map(function (array $value): array {
                $resolvedValue = trim((string) ($value['value'] ?? ''));
                $resolvedSlug = trim((string) ($value['slug'] ?? $value['label'] ?? $resolvedValue));
                $colorHex = $value['color_hex'] ?? $value['color_code'] ?? null;

                return array_filter([
                    'id' => isset($value['id']) && $value['id'] !== '' ? (int) $value['id'] : null,
                    'value' => $resolvedValue,
                    'slug' => $resolvedSlug !== '' ? Str::slug($resolvedSlug) : '',
                    'color_hex' => is_string($colorHex) && $colorHex !== '' ? mb_strtolower($colorHex) : null,
                    'position' => isset($value['position']) && $value['position'] !== '' ? (int) $value['position'] : null,
                ], fn (mixed $item): bool => $item !== null)
                    + ['color_hex' => is_string($colorHex) && $colorHex !== '' ? mb_strtolower($colorHex) : null];
            })
            ->values()
            ->all();
    }
}
