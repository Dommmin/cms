<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AttributeValue;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use Illuminate\Support\Collection;

class ProductAttributePresenter
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function serializeAttributeValues(Product $product): array
    {
        if (! $product->relationLoaded('attributeValues')) {
            return [];
        }

        $schemaByAttributeId = $this->resolveSchemaByAttributeId($product);

        return $product->attributeValues
            ->filter(fn (ProductAttributeValue $attributeValue): bool => $attributeValue->relationLoaded('attribute')
                && $attributeValue->hasMeaningfulValue())
            ->sortBy(function (ProductAttributeValue $attributeValue) use ($schemaByAttributeId): array {
                $schema = $schemaByAttributeId->get($attributeValue->attribute_id);
                $position = $schema ? (int) $schema->position : 999;

                return [
                    $position,
                    (int) $attributeValue->attribute->position,
                    $attributeValue->attribute->name,
                ];
            })
            ->map(function (ProductAttributeValue $attributeValue) use ($schemaByAttributeId): array {
                $attribute = $attributeValue->attribute;
                $valuePayload = $this->resolveSerializedAttributeValue($attributeValue);
                $schema = $schemaByAttributeId->get($attribute->id);

                return [
                    'attribute_id' => $attribute->id,
                    'slug' => $attribute->slug,
                    'label' => $attribute->name,
                    'type' => $attribute->type->value,
                    'unit' => $attribute->unit,
                    'is_required' => $schema && (bool) $schema->is_required,
                    'value' => $valuePayload['value'],
                    'display_value' => $valuePayload['display_value'],
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, array{label: string, value: string}>
     */
    public function buildAttributeSummary(Product $product): array
    {
        return collect($this->serializeAttributeValues($product))
            ->mapWithKeys(fn (array $attributeValue): array => [
                $attributeValue['slug'] => [
                    'label' => $attributeValue['label'],
                    'value' => $this->stringifyAttributeSummaryValue($attributeValue['display_value']),
                ],
            ])
            ->all();
    }

    /**
     * @return array<string, list<string>>
     */
    public function buildAttributeMap(Product $product): array
    {
        $attributeMap = [];

        foreach ($this->serializeAttributeValues($product) as $attributeValue) {
            $displayValues = $this->toDisplayStrings($attributeValue['display_value']);

            if ($displayValues === []) {
                continue;
            }

            $attributeMap[$attributeValue['label']] = $displayValues;
        }

        foreach ($this->buildLegacyVariantAttributeMap($product) as $label => $values) {
            if (! isset($attributeMap[$label])) {
                $attributeMap[$label] = [];
            }

            foreach ($values as $value) {
                if (! in_array($value, $attributeMap[$label], true)) {
                    $attributeMap[$label][] = $value;
                }
            }
        }

        return $attributeMap;
    }

    /**
     * @return array<int, array{slug: string, label: string, values: list<string>}>
     */
    public function buildVariantOptions(Product $product): array
    {
        if (! $product->relationLoaded('activeVariants')) {
            return [];
        }

        /** @var array<string, array{slug: string, label: string, position: int, values: list<string>}> $options */
        $options = [];

        foreach ($product->activeVariants as $variant) {
            if (! $variant->relationLoaded('attributeValues')) {
                continue;
            }

            foreach ($variant->attributeValues as $attributeValuePivot) {
                if (! $attributeValuePivot->relationLoaded('attribute')) {
                    continue;
                }

                if (! $attributeValuePivot->relationLoaded('attributeValue')) {
                    continue;
                }

                $attribute = $attributeValuePivot->attribute;
                $option = $attributeValuePivot->attributeValue;
                $attributeSlug = $attribute->slug;

                if (! isset($options[$attributeSlug])) {
                    $options[$attributeSlug] = [
                        'slug' => $attributeSlug,
                        'label' => $attribute->name,
                        'position' => $attribute->position,
                        'values' => [],
                    ];
                }

                if (! in_array($option->value, $options[$attributeSlug]['values'], true)) {
                    $options[$attributeSlug]['values'][] = $option->value;
                }
            }
        }

        uasort($options, fn (array $left, array $right): int => [$left['position'], $left['label']] <=> [$right['position'], $right['label']]);

        return array_map(
            fn (array $option): array => [
                'slug' => $option['slug'],
                'label' => $option['label'],
                'values' => $option['values'],
            ],
            array_values($options),
        );
    }

    /**
     * @return array<string, list<string>>
     */
    private function buildLegacyVariantAttributeMap(Product $product): array
    {
        if (! $product->relationLoaded('activeVariants')) {
            return [];
        }

        $attributeMap = [];

        foreach ($product->activeVariants as $variant) {
            if (! $variant->relationLoaded('attributeValues')) {
                continue;
            }

            foreach ($variant->attributeValues as $attributeValuePivot) {
                if (! $attributeValuePivot->relationLoaded('attribute')) {
                    continue;
                }

                if (! $attributeValuePivot->relationLoaded('attributeValue')) {
                    continue;
                }

                $key = $attributeValuePivot->attribute->name;
                $value = $attributeValuePivot->attributeValue->value;

                if (! isset($attributeMap[$key])) {
                    $attributeMap[$key] = [];
                }

                if (! in_array($value, $attributeMap[$key], true)) {
                    $attributeMap[$key][] = $value;
                }
            }
        }

        return $attributeMap;
    }

    /**
     * @return Collection<int|string, mixed>
     */
    private function resolveSchemaByAttributeId(Product $product): Collection
    {
        if (empty($product->category_id) || ! $product->relationLoaded('category')) {
            return collect();
        }

        return $product->category
            ->resolvedAttributeSchemas()
            ->keyBy('attribute_id');
    }

    /**
     * @return array{value:mixed, display_value:mixed}
     */
    private function resolveSerializedAttributeValue(ProductAttributeValue $attributeValue): array
    {
        return match ($attributeValue->attribute->type->value) {
            'numeric' => [
                'value' => $attributeValue->value_numeric !== null ? (float) $attributeValue->value_numeric : null,
                'display_value' => $attributeValue->value_numeric !== null ? (float) $attributeValue->value_numeric : null,
            ],
            'boolean' => [
                'value' => $attributeValue->value_boolean,
                'display_value' => $attributeValue->value_boolean,
            ],
            'date' => [
                'value' => $attributeValue->value_date?->toDateString(),
                'display_value' => $attributeValue->value_date?->toDateString(),
            ],
            'select' => [
                'value' => $attributeValue->selectedOption?->slug,
                'display_value' => $attributeValue->selectedOption?->value,
            ],
            'multiselect' => $this->resolveSerializedMultiselectValue($attributeValue),
            default => [
                'value' => $attributeValue->value_text,
                'display_value' => $attributeValue->value_text,
            ],
        };
    }

    /**
     * @return array{value:list<string>, display_value:list<string>}
     */
    private function resolveSerializedMultiselectValue(ProductAttributeValue $attributeValue): array
    {
        $optionIds = collect($attributeValue->value_json ?? [])
            ->filter()
            ->map(fn (mixed $optionId): int => (int) $optionId)
            ->values();

        if (! $attributeValue->attribute->relationLoaded('values')) {
            return [
                'value' => $optionIds->map(fn (int $optionId): string => (string) $optionId)->all(),
                'display_value' => $optionIds->map(fn (int $optionId): string => (string) $optionId)->all(),
            ];
        }

        $optionsById = $attributeValue->attribute->values->keyBy('id');

        return [
            'value' => $optionIds
                ->map(fn (int $optionId): ?string => $optionsById->get($optionId)?->slug)
                ->filter()
                ->values()
                ->all(),
            'display_value' => $optionIds
                ->map(fn (int $optionId): ?string => $optionsById->get($optionId)?->value)
                ->filter()
                ->values()
                ->all(),
        ];
    }

    /**
     * @return list<string>
     */
    private function toDisplayStrings(mixed $displayValue): array
    {
        if (is_array($displayValue)) {
            return collect($displayValue)
                ->map(fn (mixed $value): string => $this->stringifyAttributeSummaryValue($value))
                ->filter(fn (string $value): bool => $value !== '')
                ->values()
                ->all();
        }

        $value = $this->stringifyAttributeSummaryValue($displayValue);

        return $value === '' ? [] : [$value];
    }

    private function stringifyAttributeSummaryValue(mixed $displayValue): string
    {
        if (is_array($displayValue)) {
            return collect($displayValue)
                ->map(fn (mixed $value): string => $this->stringifyAttributeSummaryValue($value))
                ->filter()
                ->join(', ');
        }

        if (is_bool($displayValue)) {
            return $displayValue ? 'true' : 'false';
        }

        if ($displayValue === null) {
            return '';
        }

        if ($displayValue instanceof AttributeValue) {
            return $displayValue->value;
        }

        return (string) $displayValue;
    }
}
