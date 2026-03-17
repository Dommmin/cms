<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $product = $this->route('product');
        $productId = is_object($product) ? $product->getKey() : $product;

        return [
            'name' => 'required|array',
            'name.en' => 'required|string|max:255',
            'name.*' => 'nullable|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($productId),
            ],
            'description' => 'nullable',
            'description.*' => 'nullable|string',
            'short_description' => 'nullable',
            'short_description.*' => 'nullable|string|max:500',
            'sku_prefix' => 'nullable|string|max:50',
            'product_type_id' => 'required|exists:product_types,id',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'is_active' => 'boolean',
            'is_saleable' => 'boolean',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after:available_from',
            'variant' => 'nullable|array',
            'variant.id' => 'nullable|exists:product_variants,id',
            'variant.sku' => [
                'required_with:variant',
                'string',
                'max:100',
                Rule::unique('product_variants', 'sku')->ignore($this->input('variant.id')),
            ],
            'variant.price' => 'required_with:variant|integer|min:0',
            'variant.cost_price' => 'nullable|integer|min:0',
            'variant.compare_at_price' => 'nullable|integer|min:0',
            'variant.weight' => 'nullable|numeric|min:0',
            'variant.stock_quantity' => 'nullable|integer|min:0',
            'variant.stock_threshold' => 'nullable|integer|min:0',
            'variant.is_active' => 'boolean',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'flags' => 'nullable|array',
            'flags.*' => 'exists:product_flags,id',
            'images' => 'nullable|array',
            'images.*' => 'array',
            'images.*.id' => 'nullable|exists:product_images,id',
            'images.*.media_id' => 'required|exists:media,id',
            'images.*.is_thumbnail' => 'boolean',
            'images.*.position' => 'integer',
        ];
    }

    public function messages(): array
    {
        return [
            'variant.sku.required_with' => 'SKU is required when creating a variant.',
            'variant.price.required_with' => 'Price is required when creating a variant.',
            'available_until.after' => 'The available until date must be after the available from date.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');
        $nameForSlug = is_array($name)
            ? ($name[config('app.locale')] ?? array_values($name)[0] ?? '')
            : (string) $name;

        $normalizedSlug = Str::slug(
            (string) ($this->input('slug') ?: $nameForSlug)
        );

        $variant = $this->input('variant');

        if (is_array($variant)) {
            foreach (['price', 'cost_price', 'compare_at_price'] as $field) {
                if (! array_key_exists($field, $variant)) {
                    continue;
                }

                $normalizedValue = $this->normalizeMoneyValue($variant[$field]);

                if ($normalizedValue === null) {
                    unset($variant[$field]);

                    continue;
                }

                $variant[$field] = $normalizedValue;
            }
        }

        if ($this->has('flags')) {
            $flags = collect((array) $this->input('flags', []))
                ->filter(fn (mixed $flag): bool => is_numeric($flag))
                ->map(fn (mixed $flag): int => (int) $flag)
                ->values()
                ->all();

            $this->merge(['flags' => $flags]);
        }

        $this->merge([
            'slug' => $normalizedSlug,
            'variant' => is_array($variant) ? $variant : $this->input('variant'),
        ]);
    }

    private function normalizeMoneyValue(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $normalized = str_replace(',', '.', (string) $value);

        if (! is_numeric($normalized)) {
            return null;
        }

        return (int) round(((float) $normalized) * 100);
    }
}
