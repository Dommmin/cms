<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use App\Enums\PageLayoutEnum;
use App\Enums\PageTypeEnum;
use App\Models\Locale;
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

        return [
            'parent_id' => ['nullable', 'integer', 'exists:pages,id'],
            'locale' => ['nullable', 'string', 'max:10', Rule::in(Locale::query()->pluck('code')->toArray())],
            'title' => ['required'],
            'title.*' => ['nullable', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('pages', 'slug')
                    ->where('parent_id', $this->input('parent_id') ?: null)
                    ->where('locale', $this->input('locale') ?: null),
            ],
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
}
