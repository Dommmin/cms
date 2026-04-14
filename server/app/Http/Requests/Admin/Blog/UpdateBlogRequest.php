<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Blog;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBlogRequest extends FormRequest
{
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
            'name' => ['required', 'array'],
            'name.en' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blogs', 'slug')->ignore($this->route('blog'))],
            'description' => ['nullable', 'array'],
            'layout' => ['required', 'string', 'in:grid,list,magazine'],
            'posts_per_page' => ['required', 'integer', 'min:1', 'max:100'],
            'commentable' => ['boolean'],
            'default_author_id' => ['nullable', 'exists:users,id'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'available_locales' => ['nullable', 'array'],
            'position' => ['integer', 'min:0'],
        ];
    }
}
