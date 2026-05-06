<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use App\Enums\PageBlockTypeEnum;
use App\Models\Page;
use App\Services\HtmlSanitizerService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePageBuilderRequest extends FormRequest
{
    private const MAX_SECTIONS = 100;

    private const MAX_BLOCKS_PER_SECTION = 100;

    private const MAX_SNAPSHOT_BYTES = 1_048_576; // 1 MB

    private const MAX_CONFIG_BYTES = 65_536; // 64 KB per block

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
        $layoutsBySectionType = (array) config('cms.sections', []);
        $blockTypes = array_column(PageBlockTypeEnum::cases(), 'value');

        return [
            'snapshot' => ['required', 'array', $this->snapshotSizeRule()],
            'snapshot.sections' => ['sometimes', 'array', 'max:'.self::MAX_SECTIONS],
            'snapshot.sections.*.section_type' => ['required', 'string', Rule::in($sectionTypes)],
            'snapshot.sections.*.layout' => ['sometimes', 'nullable', 'string', 'max:64'],
            'snapshot.sections.*.variant' => ['sometimes', 'nullable', 'string', 'max:64'],
            'snapshot.sections.*.is_active' => ['sometimes', 'boolean'],
            'snapshot.sections.*.blocks' => ['sometimes', 'array', 'max:'.self::MAX_BLOCKS_PER_SECTION],
            'snapshot.sections.*.blocks.*.type' => ['required', 'string', Rule::in($blockTypes)],
            'snapshot.sections.*.blocks.*.is_active' => ['sometimes', 'boolean'],
            'snapshot.sections.*.blocks.*.configuration' => ['sometimes', 'nullable', 'array', $this->configurationSizeRule()],
            'snapshot.sections.*.blocks.*.relations' => ['sometimes', 'array'],
            'snapshot.sections.*.blocks.*.relations.*.type' => ['sometimes', 'required', 'string'],
            'snapshot.sections.*.blocks.*.relations.*.id' => ['sometimes', 'required', 'integer'],
            'snapshot.sections.*.blocks.*.reusable_block_id' => ['sometimes', 'nullable', 'integer', 'exists:reusable_blocks,id'],
            'snapshot.sections.*.blocks.*.reusable_block_name' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Sanitize HTML fields in block configurations after validation passes.
     */
    public function passedValidation(): void
    {
        $snapshot = $this->input('snapshot', []);
        $richTextKeys = $this->richTextConfigKeys();

        if (empty($richTextKeys) || empty($snapshot['sections'] ?? [])) {
            return;
        }

        $sanitizer = app(HtmlSanitizerService::class);
        $sections = $snapshot['sections'];

        foreach ($sections as &$section) {
            foreach ($section['blocks'] ?? [] as &$block) {
                if (! empty($block['configuration'])) {
                    $block['configuration'] = $sanitizer->sanitizeArray(
                        $block['configuration'],
                        $richTextKeys,
                    );
                }
            }
        }

        $this->merge(['snapshot' => array_merge($snapshot, ['sections' => $sections])]);
    }

    private function snapshotSizeRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (! is_array($value)) {
                return;
            }

            $encoded = json_encode($value);
            if ($encoded === false || mb_strlen($encoded) > self::MAX_SNAPSHOT_BYTES) {
                $fail(sprintf('The %s must not exceed 1MB.', $attribute));
            }
        };
    }

    private function configurationSizeRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if (! is_array($value)) {
                return;
            }

            $encoded = json_encode($value);
            if ($encoded === false || mb_strlen($encoded) > self::MAX_CONFIG_BYTES) {
                $fail(sprintf('The %s must not exceed 64KB.', $attribute));
            }
        };
    }

    /**
     * Collect all configuration keys that are declared as richtext/html across all block schemas.
     *
     * @return list<string>
     */
    private function richTextConfigKeys(): array
    {
        $blocks = (array) config('blocks', []);
        $keys = [];

        foreach ($blocks as $blockConfig) {
            $properties = $blockConfig['schema']['properties'] ?? [];
            foreach ($properties as $fieldKey => $field) {
                if (in_array($field['format'] ?? '', ['richtext', 'html'], true)) {
                    $keys[] = $fieldKey;
                }
            }
        }

        return array_unique($keys);
    }
}
