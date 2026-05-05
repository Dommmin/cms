<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use App\Enums\PageBlockTypeEnum;
use App\Models\Page;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePageBuilderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $page = Page::query()->find($this->route('page'));

        if (! $page) {
            return false;
        }

        return $this->user()?->can('update', $page) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $sectionTypes = array_keys((array) config('cms.sections', []));
        $blockTypes = array_column(PageBlockTypeEnum::cases(), 'value');
        $configRule = $this->configurationSizeRule();

        return [
            'snapshot' => ['required', 'array'],
            'snapshot.sections' => ['sometimes', 'array'],
            'snapshot.sections.*.section_type' => ['required', 'string', Rule::in($sectionTypes)],
            'snapshot.sections.*.blocks' => ['sometimes', 'array'],
            'snapshot.sections.*.blocks.*.type' => ['required', 'string', Rule::in($blockTypes)],
            'snapshot.sections.*.blocks.*.configuration' => ['sometimes', 'nullable', 'array', $configRule],
        ];
    }

    private function configurationSizeRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (! is_array($value)) {
                return;
            }

            $encoded = json_encode($value);
            if ($encoded === false || mb_strlen($encoded) > 65536) {
                $fail(sprintf('The %s must not exceed 64KB.', $attribute));
            }
        };
    }
}
