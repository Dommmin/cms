<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce\Concerns;

use App\Enums\AttributeTypeEnum;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Date;
use Throwable;

trait InteractsWithProductAttributeValues
{
    protected function normalizeProductAttributeValues(): void
    {
        if (! $this->exists('attribute_values')) {
            return;
        }

        $attributeValues = $this->input('attribute_values');

        if (! is_array($attributeValues)) {
            $this->merge(['attribute_values' => []]);

            return;
        }

        $normalized = collect($attributeValues)
            ->filter(fn (mixed $item): bool => is_array($item))
            ->map(function (array $item): array {
                $optionIds = collect((array) ($item['option_ids'] ?? []))
                    ->filter(fn (mixed $optionId): bool => is_numeric($optionId))
                    ->map(fn (mixed $optionId): int => (int) $optionId)
                    ->unique()
                    ->values()
                    ->all();

                $value = $item['value'] ?? null;
                if (is_string($value)) {
                    $value = mb_trim($value);
                } elseif (is_bool($value)) {
                    $value = $value ? '1' : '0';
                } elseif (is_numeric($value)) {
                    $value = (string) $value;
                } else {
                    $value = null;
                }

                return [
                    'attribute_id' => is_numeric($item['attribute_id'] ?? null) ? (int) $item['attribute_id'] : null,
                    'value' => $value,
                    'option_id' => is_numeric($item['option_id'] ?? null) ? (int) $item['option_id'] : null,
                    'option_ids' => $optionIds,
                ];
            })
            ->filter(fn (array $item): bool => $item['attribute_id'] !== null)
            ->values()
            ->all();

        $this->merge(['attribute_values' => $normalized]);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    protected function productAttributeValueRules(): array
    {
        return [
            'attribute_values' => ['nullable', 'array'],
            'attribute_values.*' => ['array'],
            'attribute_values.*.attribute_id' => ['required', 'integer', 'exists:attributes,id'],
            'attribute_values.*.value' => ['nullable'],
            'attribute_values.*.option_id' => ['nullable', 'integer', 'exists:attribute_values,id'],
            'attribute_values.*.option_ids' => ['nullable', 'array'],
            'attribute_values.*.option_ids.*' => ['integer', 'exists:attribute_values,id'],
        ];
    }

    protected function validateProductAttributeValues($validator): void
    {
        $categoryId = $this->input('category_id');
        if (! is_numeric($categoryId)) {
            return;
        }

        $category = Category::query()->find((int) $categoryId);
        if (! $category instanceof Category) {
            return;
        }

        $schema = $category->resolvedAttributeSchemas()->keyBy('attribute_id');
        $attributeValues = collect($this->input('attribute_values', []));

        $duplicates = $attributeValues
            ->pluck('attribute_id')
            ->filter(fn (mixed $attributeId): bool => is_numeric($attributeId))
            ->duplicates();

        if ($duplicates->isNotEmpty()) {
            $validator->errors()->add('attribute_values', 'Each core attribute can only be submitted once.');
        }

        $existingValues = $this->existingProductAttributeValues($category);

        $attributeValues->each(function (array $item, int $index) use ($schema, $validator): void {
            $attributeId = (int) $item['attribute_id'];
            $schemaItem = $schema->get($attributeId);

            if ($schemaItem === null) {
                $validator->errors()->add(
                    sprintf('attribute_values.%d.attribute_id', $index),
                    'The selected core attribute does not belong to the category schema.'
                );

                return;
            }

            $attribute = $schemaItem->attribute;
            $value = $item['value'];
            $optionId = $item['option_id'];
            $optionIds = collect($item['option_ids'] ?? []);
            $allowedOptionIds = $attribute->values()->pluck('id');

            match ($attribute->type) {
                AttributeTypeEnum::TEXT => $this->validateTextAttributeValue($validator, $index, $value),
                AttributeTypeEnum::NUMERIC => $this->validateNumericAttributeValue($validator, $index, $value),
                AttributeTypeEnum::BOOLEAN => $this->validateBooleanAttributeValue($validator, $index, $value),
                AttributeTypeEnum::COLOR => $this->validateColorAttributeValue($validator, $index, $value),
                AttributeTypeEnum::DATE => $this->validateDateAttributeValue($validator, $index, $value),
                AttributeTypeEnum::SELECT => $this->validateSelectAttributeValue($validator, $index, $optionId, $allowedOptionIds),
                AttributeTypeEnum::MULTISELECT => $this->validateMultiselectAttributeValue($validator, $index, $optionIds, $allowedOptionIds),
                default => null,
            };
        });

        $schema->each(function ($schemaItem, int $attributeId) use ($attributeValues, $existingValues, $validator): void {
            if (! $schemaItem->is_required) {
                return;
            }

            $submitted = $attributeValues->firstWhere('attribute_id', $attributeId);
            if (is_array($submitted) && $this->hasMeaningfulSubmittedValue($schemaItem->attribute->type, $submitted)) {
                return;
            }

            $existing = $existingValues->get($attributeId);
            if ($existing instanceof ProductAttributeValue && $existing->hasMeaningfulValue()) {
                return;
            }

            $validator->errors()->add(
                'attribute_values',
                sprintf('The %s attribute is required for the selected category.', $schemaItem->attribute->name)
            );
        });
    }

    private function existingProductAttributeValues(Category $selectedCategory): Collection
    {
        $product = $this->route('product');
        if (! $product instanceof Product) {
            return collect();
        }

        if ((int) $product->category_id !== (int) $selectedCategory->id) {
            return collect();
        }

        return $product->attributeValues()->with('attribute')->get()->keyBy('attribute_id');
    }

    private function hasMeaningfulSubmittedValue(AttributeTypeEnum $type, array $payload): bool
    {
        return match ($type) {
            AttributeTypeEnum::TEXT,
            AttributeTypeEnum::NUMERIC,
            AttributeTypeEnum::COLOR,
            AttributeTypeEnum::DATE,
            AttributeTypeEnum::BOOLEAN => $payload['value'] !== null && $payload['value'] !== '',
            AttributeTypeEnum::SELECT => is_numeric($payload['option_id'] ?? null),
            AttributeTypeEnum::MULTISELECT => collect($payload['option_ids'] ?? [])->isNotEmpty(),
        };
    }

    private function validateTextAttributeValue($validator, int $index, mixed $value): void
    {
        if ($value !== null && ! is_string($value)) {
            $validator->errors()->add(sprintf('attribute_values.%d.value', $index), 'The value must be a string.');
        }
    }

    private function validateNumericAttributeValue($validator, int $index, mixed $value): void
    {
        if ($value !== null && $value !== '' && ! is_numeric($value)) {
            $validator->errors()->add(sprintf('attribute_values.%d.value', $index), 'The value must be numeric.');
        }
    }

    private function validateBooleanAttributeValue($validator, int $index, mixed $value): void
    {
        if ($value === null || $value === '') {
            return;
        }

        if (! in_array($value, ['0', '1', 'true', 'false'], true)) {
            $validator->errors()->add(sprintf('attribute_values.%d.value', $index), 'The value must be true or false.');
        }
    }

    private function validateColorAttributeValue($validator, int $index, mixed $value): void
    {
        if ($value !== null && $value !== '' && (! is_string($value) || ! preg_match('/^#[0-9a-f]{6}$/i', $value))) {
            $validator->errors()->add(sprintf('attribute_values.%d.value', $index), 'The value must be a valid hex color.');
        }
    }

    private function validateDateAttributeValue($validator, int $index, mixed $value): void
    {
        if ($value === null || $value === '') {
            return;
        }

        try {
            Date::parse((string) $value);
        } catch (Throwable) {
            $validator->errors()->add(sprintf('attribute_values.%d.value', $index), 'The value must be a valid date.');
        }
    }

    private function validateSelectAttributeValue($validator, int $index, mixed $optionId, Collection $allowedOptionIds): void
    {
        if ($optionId === null) {
            return;
        }

        if ($allowedOptionIds->doesntContain((int) $optionId)) {
            $validator->errors()->add(sprintf('attribute_values.%d.option_id', $index), 'The selected option does not belong to the attribute.');
        }
    }

    private function validateMultiselectAttributeValue($validator, int $index, Collection $optionIds, Collection $allowedOptionIds): void
    {
        if ($optionIds->duplicates()->isNotEmpty()) {
            $validator->errors()->add(sprintf('attribute_values.%d.option_ids', $index), 'Selected options must be unique.');
        }

        if ($optionIds->diff($allowedOptionIds)->isNotEmpty()) {
            $validator->errors()->add(sprintf('attribute_values.%d.option_ids', $index), 'One or more selected options do not belong to the attribute.');
        }
    }
}
