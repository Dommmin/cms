<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Validator;

class UpdateCategoryRequest extends FormRequest
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
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                foreach ($this->input('slug', []) as $locale => $slug) {
                    if (Category::query()
                        ->where('slug->'.$locale, $slug)
                        ->whereKeyNot($this->route('category'))
                        ->exists()) {
                        $validator->errors()->add('slug.'.$locale, 'The slug must be unique for this locale.');
                    }
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

        $this->merge([
            'slug' => array_filter(
                array_map(
                    fn (mixed $value): string => Str::slug((string) ($value ?: $nameForSlug)),
                    $slugInput,
                ),
                fn (string $value): bool => $value !== '',
            ),
        ]);
    }
}
