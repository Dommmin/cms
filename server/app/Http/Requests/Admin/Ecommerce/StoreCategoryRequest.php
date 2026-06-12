<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreCategoryRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required'],
            'name.*' => ['nullable', 'string', 'max:255'],
            'slug' => ['required', 'array'],
            'slug.*' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'description' => ['nullable'],
            'description.*' => ['nullable', 'string'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'is_active' => ['boolean'],
            'collection_type' => ['sometimes', 'string', 'in:manual,smart'],
            'rules' => ['nullable', 'array'],
            'rules.*' => ['nullable', 'array'],
            'rules.*.field' => ['nullable', 'string'],
            'rules.*.condition' => ['nullable', 'string'],
            'rules.*.value' => ['nullable'],
            'rules_match' => ['sometimes', 'string', 'in:all,any'],
            'attribute_schema' => ['sometimes', 'array'],
            'attribute_schema.*' => ['array'],
            'attribute_schema.*.attribute_id' => ['required', 'integer', 'exists:attributes,id'],
            'attribute_schema.*.is_required' => ['sometimes', 'boolean'],
            'attribute_schema.*.position' => ['sometimes', 'integer', 'min:0', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                foreach ($this->input('slug', []) as $locale => $slug) {
                    if (Category::query()->where('slug->'.$locale, $slug)->exists()) {
                        $validator->errors()->add('slug.'.$locale, 'The slug must be unique for this locale.');
                    }
                }
            },
            function (Validator $validator): void {
                $attributeIds = collect($this->input('attribute_schema', []))
                    ->pluck('attribute_id')
                    ->filter()
                    ->map(fn (mixed $id): int => (int) $id);

                if ($attributeIds->duplicates()->isNotEmpty()) {
                    $validator->errors()->add('attribute_schema', 'Attribute schema entries must be unique per category.');
                }
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $defaultLocale = config('app.locale');
        $name = $this->input('name');
        $nameForSlug = is_array($name)
            ? ($name[$defaultLocale] ?? array_values($name)[0] ?? '')
            : (string) $name;
        $slug = $this->input('slug');
        $slugInput = is_array($slug) ? $slug : [$defaultLocale => $slug];

        $payload = [
            'slug' => array_filter(
                array_map(
                    fn (mixed $value): string => Str::slug((string) ($value ?: $nameForSlug)),
                    $slugInput,
                ),
                fn (string $value): bool => $value !== '',
            ),
        ];

        if (is_array($this->input('attribute_schema'))) {
            $payload['attribute_schema'] = collect($this->input('attribute_schema', []))
                ->filter(fn (mixed $row): bool => is_array($row) && filled($row['attribute_id'] ?? null))
                ->values()
                ->map(
                    fn (array $row, int $index): array => [
                        'attribute_id' => (int) $row['attribute_id'],
                        'is_required' => filter_var($row['is_required'] ?? false, FILTER_VALIDATE_BOOL),
                        'position' => isset($row['position']) ? (int) $row['position'] : $index,
                    ]
                )
                ->all();
        }

        $this->merge($payload);
    }
}
