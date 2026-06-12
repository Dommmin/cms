<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Concerns;

use App\Models\MetafieldDefinition;
use Closure;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Date;
use Throwable;

trait InteractsWithMetafields
{
    protected function normalizeMetafields(): void
    {
        if (! $this->exists('metafields')) {
            return;
        }

        $metafields = $this->input('metafields');

        if (! is_array($metafields)) {
            $this->merge(['metafields' => []]);

            return;
        }

        $normalized = collect($metafields)
            ->filter(fn (mixed $item): bool => is_array($item))
            ->map(function (array $item): array {
                $value = $item['value'] ?? null;

                if (is_string($value)) {
                    $value = mb_trim($value);
                }

                return [
                    'namespace' => is_string($item['namespace'] ?? null) ? mb_trim($item['namespace']) : '',
                    'key' => is_string($item['key'] ?? null) ? mb_trim($item['key']) : '',
                    'type' => is_string($item['type'] ?? null) ? mb_trim($item['type']) : '',
                    'value' => $value,
                    '_delete' => filter_var($item['_delete'] ?? false, FILTER_VALIDATE_BOOL),
                ];
            })
            ->filter(fn (array $item): bool => $item['namespace'] !== '' && $item['key'] !== '')
            ->values()
            ->all();

        $this->merge(['metafields' => $normalized]);
    }

    /**
     * @return array<string, array<int, string>>
     */
    protected function metafieldRules(): array
    {
        return [
            'metafields' => ['nullable', 'array'],
            'metafields.*' => ['array'],
            'metafields.*.namespace' => ['required', 'string', 'max:64', 'regex:/^[a-z0-9_]+$/'],
            'metafields.*.key' => ['required', 'string', 'max:64', 'regex:/^[a-z0-9_]+$/'],
            'metafields.*.type' => ['required', 'string', 'in:string,integer,float,boolean,json,date,datetime,url,color,image,rich_text'],
            'metafields.*.value' => ['nullable'],
            'metafields.*._delete' => ['boolean'],
        ];
    }

    /**
     * @return array<int, Closure(Validator):void>
     */
    protected function validateMetafields(string $ownerType): array
    {
        return [
            function ($validator) use ($ownerType): void {
                $definitions = $this->metafieldDefinitionsForOwner($ownerType);
                $submitted = collect($this->input('metafields', []))
                    ->filter(fn (mixed $item): bool => is_array($item))
                    ->values();

                $duplicates = $submitted
                    ->map(fn (array $item): string => $this->metafieldKey((string) $item['namespace'], (string) $item['key']))
                    ->duplicates();

                if ($duplicates->isNotEmpty()) {
                    $validator->errors()->add('metafields', 'Each metafield must be unique per namespace and key.');
                }

                $submitted->each(function (array $item, int $index) use ($definitions, $validator): void {
                    if (filter_var($item['_delete'] ?? false, FILTER_VALIDATE_BOOL)) {
                        return;
                    }

                    $definitionKey = $this->metafieldKey((string) $item['namespace'], (string) $item['key']);
                    $definition = $definitions->get($definitionKey);

                    if (! $definition instanceof MetafieldDefinition) {
                        $validator->errors()->add(
                            sprintf('metafields.%d.key', $index),
                            'The selected metafield is not defined for this content type.',
                        );

                        return;
                    }

                    if ($this->isReservedMetafieldDefinition($definition)) {
                        $validator->errors()->add(
                            sprintf('metafields.%d.key', $index),
                            'This metafield key is reserved for core content data.',
                        );

                        return;
                    }

                    if ($definition->type !== $item['type']) {
                        $validator->errors()->add(
                            sprintf('metafields.%d.type', $index),
                            'The metafield type must match its definition.',
                        );
                    }

                    $this->validateMetafieldValue($validator, $index, $definition->type, $item['value'] ?? null);
                });
            },
        ];
    }

    /**
     * @return Collection<string, MetafieldDefinition>
     */
    private function metafieldDefinitionsForOwner(string $ownerType): Collection
    {
        return MetafieldDefinition::query()
            ->forOwnerType($ownerType)
            ->get()
            ->keyBy(fn (MetafieldDefinition $definition): string => $this->metafieldKey($definition->namespace, $definition->key));
    }

    private function validateMetafieldValue($validator, int $index, string $type, mixed $value): void
    {
        if ($value === null || $value === '') {
            return;
        }

        match ($type) {
            'string', 'image', 'rich_text' => is_string($value) || is_numeric($value) || is_bool($value)
                ? null
                : $validator->errors()->add(sprintf('metafields.%d.value', $index), 'The metafield value must be a string.'),
            'integer' => is_numeric($value)
                ? null
                : $validator->errors()->add(sprintf('metafields.%d.value', $index), 'The metafield value must be an integer.'),
            'float' => is_numeric($value)
                ? null
                : $validator->errors()->add(sprintf('metafields.%d.value', $index), 'The metafield value must be numeric.'),
            'boolean' => $this->validateBooleanMetafieldValue($validator, $index, $value),
            'json' => $this->validateJsonMetafieldValue($validator, $index, $value),
            'date' => $this->validateDateMetafieldValue($validator, $index, $value),
            'datetime' => $this->validateDateTimeMetafieldValue($validator, $index, $value),
            'url' => filter_var((string) $value, FILTER_VALIDATE_URL)
                ? null
                : $validator->errors()->add(sprintf('metafields.%d.value', $index), 'The metafield value must be a valid URL.'),
            'color' => preg_match('/^#[0-9a-f]{6}$/i', (string) $value) === 1
                ? null
                : $validator->errors()->add(sprintf('metafields.%d.value', $index), 'The metafield value must be a valid hex color.'),
            default => null,
        };
    }

    private function validateBooleanMetafieldValue($validator, int $index, mixed $value): void
    {
        if (is_bool($value)) {
            return;
        }

        if (! in_array($value, ['true', 'false', '1', '0', 1, 0], true)) {
            $validator->errors()->add(sprintf('metafields.%d.value', $index), 'The metafield value must be true or false.');
        }
    }

    private function validateJsonMetafieldValue($validator, int $index, mixed $value): void
    {
        if (is_array($value) || is_object($value)) {
            return;
        }

        if (! is_string($value)) {
            $validator->errors()->add(sprintf('metafields.%d.value', $index), 'The metafield value must be valid JSON.');

            return;
        }

        try {
            json_decode($value, true, flags: JSON_THROW_ON_ERROR);
        } catch (Throwable) {
            $validator->errors()->add(sprintf('metafields.%d.value', $index), 'The metafield value must be valid JSON.');
        }
    }

    private function validateDateMetafieldValue($validator, int $index, mixed $value): void
    {
        try {
            Date::parse((string) $value)->startOfDay();
        } catch (Throwable) {
            $validator->errors()->add(sprintf('metafields.%d.value', $index), 'The metafield value must be a valid date.');
        }
    }

    private function validateDateTimeMetafieldValue($validator, int $index, mixed $value): void
    {
        try {
            Date::parse((string) $value);
        } catch (Throwable) {
            $validator->errors()->add(sprintf('metafields.%d.value', $index), 'The metafield value must be a valid datetime.');
        }
    }

    private function isReservedMetafieldDefinition(MetafieldDefinition $definition): bool
    {
        return in_array($definition->namespace, $this->reservedMetafieldNamespaces(), true)
            || in_array($definition->key, $this->reservedMetafieldKeys(), true);
    }

    /**
     * @return array<int, string>
     */
    private function reservedMetafieldNamespaces(): array
    {
        return ['seo', 'pricing', 'stock', 'tax', 'shipping', 'checkout', 'variants', 'attributes'];
    }

    /**
     * @return array<int, string>
     */
    private function reservedMetafieldKeys(): array
    {
        return [
            'sku',
            'stock',
            'stock_quantity',
            'price',
            'compare_at_price',
            'cost_price',
            'category_id',
            'brand_id',
            'product_type_id',
            'variant_option_selection',
            'seo_title',
            'seo_description',
            'meta_robots',
            'canonical_url',
            'og_image',
        ];
    }

    private function metafieldKey(string $namespace, string $key): string
    {
        return $namespace.'::'.$key;
    }
}
