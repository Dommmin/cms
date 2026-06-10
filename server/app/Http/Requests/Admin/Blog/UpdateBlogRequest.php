<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Blog;

use App\Models\Blog;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

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
            'slug' => ['nullable', 'array'],
            'slug.*' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'description' => ['nullable', 'array'],
            'layout' => ['required', 'string', 'in:grid,list,magazine'],
            'commentable' => ['boolean'],
            'default_author_id' => ['nullable', 'exists:users,id'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'available_locales' => ['nullable', 'array'],
            'position' => ['integer', 'min:0'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                foreach ($this->input('slug', []) as $locale => $slug) {
                    if (Blog::query()
                        ->where('slug->'.$locale, $slug)
                        ->whereKeyNot($this->route('blog'))
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
        $name = $this->input('name', []);
        $nameForSlug = is_array($name) ? ($name[$defaultLocale] ?? $name['en'] ?? array_values($name)[0] ?? '') : (string) $name;
        $slug = $this->input('slug');
        $slugInput = is_array($slug) ? $slug : [$defaultLocale => $slug];

        if ($slug === null || $slug === '') {
            $slugInput = [$defaultLocale => $nameForSlug];
        }

        $this->merge([
            'slug' => array_filter(
                array_map(fn (mixed $value): string => Str::slug((string) $value), $slugInput),
                fn (string $value): bool => $value !== '',
            ),
        ]);
    }
}
