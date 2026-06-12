<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use App\Enums\AttributeTypeEnum;
use App\Http\Requests\Admin\Ecommerce\Concerns\NormalizesAttributePayload;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttributeRequest extends FormRequest
{
    use NormalizesAttributePayload;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:attributes,slug'],
            'type' => ['required', Rule::enum(AttributeTypeEnum::class)],
            'unit' => ['nullable', 'string', 'max:50'],
            'is_filterable' => ['boolean'],
            'is_variant_selection' => ['boolean'],
            'position' => ['nullable', 'integer'],
            'values' => ['nullable', 'array'],
            'values.*.value' => ['required_with:values', 'string', 'max:255'],
            'values.*.slug' => ['required_with:values', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'values.*.color_hex' => ['nullable', 'regex:/^#[0-9a-f]{6}$/'],
            'values.*.position' => ['nullable', 'integer'],
        ];
    }

    public function after(): array
    {
        return [
            function ($validator): void {
                $type = $this->input('type');
                $supportsLegacyOptions = in_array($type, [
                    AttributeTypeEnum::SELECT->value,
                    AttributeTypeEnum::MULTISELECT->value,
                    AttributeTypeEnum::COLOR->value,
                ], true);

                if (! $supportsLegacyOptions && $this->boolean('is_filterable')) {
                    $validator->errors()->add('is_filterable', 'Only select, multiselect, and color attributes can be used in storefront filters.');
                }

                if (! $supportsLegacyOptions && $this->boolean('is_variant_selection')) {
                    $validator->errors()->add('is_variant_selection', 'Only select, multiselect, and color attributes can be used for product variants.');
                }

                $slugs = collect($this->input('values', []))
                    ->pluck('slug')
                    ->filter(fn (mixed $slug): bool => is_string($slug) && $slug !== '');

                if ($slugs->count() !== $slugs->unique()->count()) {
                    $validator->errors()->add('values', 'Attribute value slugs must be unique within the attribute.');
                }
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeAttributePayload();
    }
}
