<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductVariantRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $variant = $this->route('variant');

        return [
            'sku' => ['required', 'string', 'max:255', 'unique:product_variants,sku,'.$variant?->id],
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'cost_price' => ['nullable', 'integer', 'min:0'],
            'compare_at_price' => ['nullable', 'integer', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'stock_threshold' => ['nullable', 'integer', 'min:0'],
            'tax_rate_id' => ['nullable', 'exists:tax_rates,id'],
            'is_active' => ['sometimes', 'boolean'],
            'is_default' => ['sometimes', 'boolean'],
            'attribute_values' => ['nullable', 'array'],
            'attribute_values.*' => ['exists:attribute_values,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['price', 'cost_price', 'compare_at_price'] as $field) {
            if (! array_key_exists($field, $data)) {
                continue;
            }

            $normalized = $this->normalizeMoneyValue($data[$field]);

            if ($normalized === null) {
                unset($data[$field]);

                continue;
            }

            $data[$field] = $normalized;
        }

        $data['attribute_values'] = collect((array) $this->input('attribute_values', []))
            ->filter(fn (mixed $value): bool => is_numeric($value))
            ->map(fn (mixed $value): int => (int) $value)
            ->values()
            ->all();

        $this->replace($data);
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
