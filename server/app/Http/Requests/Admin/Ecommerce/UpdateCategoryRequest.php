<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

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
            'slug' => 'required|string|max:255|unique:categories,slug,'.$this->category->id,
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

    protected function prepareForValidation(): void
    {
        $name = $this->input('name');
        $nameForSlug = is_array($name)
            ? ($name[config('app.locale')] ?? array_values($name)[0] ?? '')
            : (string) $name;

        $this->merge([
            'slug' => Str::slug((string) ($this->input('slug') ?: $nameForSlug)),
        ]);
    }
}
