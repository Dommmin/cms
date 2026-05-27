<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBlogPostRequest extends FormRequest
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
        $defaultLocale = config('app.locale');
        $isDraft = $this->input('status') === 'draft';

        return [
            'title' => ['required', 'array'],
            'title.*' => ['nullable', 'string', 'max:255'],
            'title.'.$defaultLocale => [$isDraft ? 'nullable' : 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'array'],
            'slug.*' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'excerpt' => ['nullable', 'array'],
            'excerpt.*' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'array'],
            'content.*' => ['nullable', 'string'],
            'content.'.$defaultLocale => [$isDraft ? 'nullable' : 'required', 'string'],
            'content_json' => ['nullable', 'array'],
            'content_json.*' => ['nullable', 'string'],
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
            'canonical_url' => ['nullable', 'url', 'max:255'],
            'meta_robots' => ['nullable', 'string', 'max:100'],
            'og_image' => ['nullable', 'string', 'max:255'],
            'sitemap_exclude' => ['sometimes', 'boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        $defaultLocale = config('app.locale');
        $isDraft = $this->input('status') === 'draft';

        $messages = [];

        if (! $isDraft) {
            $messages[sprintf('title.%s.required', $defaultLocale)] = 'The title is required for the default language.';
            $messages[sprintf('content.%s.required', $defaultLocale)] = 'The content is required for the default language.';
        }

        return $messages;
    }
}
