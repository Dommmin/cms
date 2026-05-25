<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use App\Enums\PageLayoutEnum;
use App\Enums\PageTypeEnum;
use App\Models\Locale;
use App\Models\Page;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        $modules = array_keys((array) config('cms.modules', []));
        $defaultLocale = config('app.locale');

        return [
            'parent_id' => ['nullable', 'integer', 'exists:pages,id'],
            'locale' => ['nullable', 'string', 'max:10', Rule::in(Locale::query()->pluck('code')->toArray())],
            'title' => ['required'],
            'title.*' => ['nullable', 'string', 'max:255'],
            'slug' => ['required', 'array'],
            'slug.*' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'slug.'.$defaultLocale => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable'],
            'excerpt.*' => ['nullable', 'string', 'max:1000'],
            'layout' => ['required', Rule::enum(PageLayoutEnum::class)],
            'page_type' => ['required', Rule::enum(PageTypeEnum::class)],
            'module_name' => [
                Rule::requiredIf(fn (): bool => $this->input('page_type') === PageTypeEnum::Module->value),
                'nullable',
                'string',
                Rule::in($modules),
            ],
            'module_config' => ['nullable', 'array'],
            'module_config.content_id' => [
                Rule::requiredIf(fn (): bool => $this->input('page_type') === PageTypeEnum::Module->value && $this->input('module_name') === 'content'),
                'integer',
                'exists:content_entries,id',
            ],
            'module_config.category' => ['nullable', 'string', 'max:255'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
            'seo_canonical' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $parentId = $this->input('parent_id') ?: null;
            $locale = $this->input('locale') ?: null;
            $slugInput = $this->input('slug', []);

            if (! is_array($slugInput)) {
                return;
            }

            foreach ($slugInput as $localeCode => $slugValue) {
                if (empty($slugValue)) {
                    continue;
                }

                $exists = Page::query()
                    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(slug, '$.\"' || ? || '\"')) = ?", [$localeCode, $slugValue])
                    ->where('parent_id', $parentId)
                    ->where('locale', $locale)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('slug.'.$localeCode, 'The slug must be unique for this parent and locale.');
                }
            }
        });
    }
}
