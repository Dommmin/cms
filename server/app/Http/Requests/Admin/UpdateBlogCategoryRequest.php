<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBlogCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:100', Rule::unique('blog_categories', 'slug')->ignore($this->route('category'))],
            'description' => ['nullable', 'string', 'max:500'],
            'parent_id' => ['nullable', 'integer', 'exists:blog_categories,id'],
            'is_active' => ['sometimes', 'boolean'],
            'position' => ['nullable', 'integer'],
        ];
    }
}
