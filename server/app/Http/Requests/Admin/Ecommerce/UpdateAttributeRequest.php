<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use App\Enums\AttributeTypeEnum;
use App\Http\Requests\Admin\Ecommerce\Concerns\NormalizesAttributePayload;
use App\Models\AttributeValue;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAttributeRequest extends FormRequest
{
    use NormalizesAttributePayload;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => 'required|string|max:255|unique:attributes,slug,'.$this->attribute->id,
            'type' => ['required', Rule::enum(AttributeTypeEnum::class)],
            'unit' => ['nullable', 'string', 'max:50'],
            'is_filterable' => ['boolean'],
            'is_variant_selection' => ['boolean'],
            'position' => ['nullable', 'integer'],
            'values' => ['nullable', 'array'],
            'values.*.id' => ['nullable', 'integer', 'exists:attribute_values,id'],
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
                $slugs = collect($this->input('values', []))
                    ->pluck('slug')
                    ->filter(fn (mixed $slug): bool => is_string($slug) && $slug !== '');

                if ($slugs->count() !== $slugs->unique()->count()) {
                    $validator->errors()->add('values', 'Attribute value slugs must be unique within the attribute.');
                }

                $valueIds = collect($this->input('values', []))
                    ->pluck('id')
                    ->filter(fn (mixed $id): bool => is_numeric($id))
                    ->map(fn (mixed $id): int => (int) $id)
                    ->values();

                if ($valueIds->isEmpty()) {
                    return;
                }

                $matchedIds = AttributeValue::query()
                    ->where('attribute_id', $this->attribute->id)
                    ->whereIn('id', $valueIds->all())
                    ->pluck('id');

                if ($matchedIds->count() !== $valueIds->count()) {
                    $validator->errors()->add('values', 'Every attribute value id must belong to the edited attribute.');
                }
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeAttributePayload();
    }
}
