<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogPostRequest extends FormRequest
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
        $defaultLocale = config('app.locale');

        return [
            'title' => ['required', 'array'],
            'title.*' => ['nullable', 'string', 'max:255'],
            "title.{$defaultLocale}" => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:blog_posts,slug'],
            'excerpt' => ['nullable', 'array'],
            'excerpt.*' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'array'],
            'content.*' => ['nullable', 'string'],
            "content.{$defaultLocale}" => ['required', 'string'],
            'content_type' => ['required', 'in:richtext,markdown'],
            'status' => ['required', 'in:draft,scheduled,published,archived'],
            'published_at' => ['nullable', 'date', 'required_if:status,scheduled'],
            'blog_category_id' => ['nullable', 'integer', 'exists:blog_categories,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'available_locales' => ['nullable', 'array'],
            'available_locales.*' => ['string', 'max:10'],
            'is_featured' => ['sometimes', 'boolean'],
            'featured_image' => ['nullable', 'string', 'max:255'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        $defaultLocale = config('app.locale');

        return [
            "title.{$defaultLocale}.required" => 'The title is required for the default language.',
            "content.{$defaultLocale}.required" => 'The content is required for the default language.',
        ];
    }
}
