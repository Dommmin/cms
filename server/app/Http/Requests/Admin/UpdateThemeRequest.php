<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateThemeRequest extends FormRequest
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
        $theme = $this->route('theme');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:themes,slug,'.$theme?->id],
            'description' => ['nullable', 'string'],
            'tokens' => ['nullable', 'array'],
            'tokens.*' => ['string', 'max:100'],
            'dark_tokens' => ['nullable', 'array'],
            'dark_tokens.*' => ['string', 'max:100'],
            'draft_tokens' => ['nullable', 'array'],
            'draft_tokens.*' => ['string', 'max:100'],
            'font_sources' => ['nullable', 'array'],
            'font_sources.heading' => ['nullable', 'array'],
            'font_sources.body' => ['nullable', 'array'],
            'branding' => ['nullable', 'array'],
            'branding.logo_url' => ['nullable', 'string', 'max:2048'],
            'branding.logo_dark_url' => ['nullable', 'string', 'max:2048'],
            'branding.favicon_url' => ['nullable', 'string', 'max:2048'],
            'typography' => ['nullable', 'array'],
            'typography.heading_font' => ['nullable', 'string', 'max:100'],
            'typography.body_font' => ['nullable', 'string', 'max:100'],
            'typography.base_size' => ['nullable', 'string', 'max:20'],
            'typography.scale' => ['nullable', 'string', 'max:10'],
            'typography.h1_size' => ['nullable', 'string', 'max:20'],
            'typography.h2_size' => ['nullable', 'string', 'max:20'],
            'typography.h3_size' => ['nullable', 'string', 'max:20'],
            'typography.h4_size' => ['nullable', 'string', 'max:20'],
            'spacing' => ['nullable', 'array'],
            'spacing.section_padding' => ['nullable', 'string', 'max:20'],
            'spacing.block_gap' => ['nullable', 'string', 'max:20'],
            'spacing.container_padding' => ['nullable', 'string', 'max:20'],
            'buttons' => ['nullable', 'array'],
            'buttons.primary_border_radius' => ['nullable', 'string', 'max:20'],
            'buttons.primary_padding_x' => ['nullable', 'string', 'max:20'],
            'buttons.primary_padding_y' => ['nullable', 'string', 'max:20'],
            'buttons.secondary_border_radius' => ['nullable', 'string', 'max:20'],
            'buttons.secondary_padding_x' => ['nullable', 'string', 'max:20'],
            'buttons.secondary_padding_y' => ['nullable', 'string', 'max:20'],
            'containers' => ['nullable', 'array'],
            'containers.max_width' => ['nullable', 'string', 'max:20'],
            'containers.content_width' => ['nullable', 'string', 'max:20'],
            'containers.narrow_width' => ['nullable', 'string', 'max:20'],
            'settings' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $tokens = collect((array) $this->input('tokens', []))
            ->mapWithKeys(fn (mixed $value, mixed $key): array => [mb_trim((string) $key) => is_string($value) ? mb_trim($value) : ''])
            ->filter(fn (string $value): bool => $value !== '')
            ->all();

        $this->merge([
            'tokens' => $tokens !== [] ? $tokens : null,
        ]);

        $this->mergeNullableJsonField('typography');
        $this->mergeNullableJsonField('font_sources');
        $this->mergeNullableJsonField('branding');
        $this->mergeNullableJsonField('draft_tokens');
        $this->mergeNullableJsonField('dark_tokens');
        $this->mergeNullableJsonField('spacing');
        $this->mergeNullableJsonField('buttons');
        $this->mergeNullableJsonField('containers');
    }

    private function mergeNullableJsonField(string $field): void
    {
        $data = collect((array) $this->input($field, []))
            ->mapWithKeys(fn (mixed $value, mixed $key): array => [mb_trim((string) $key) => is_string($value) ? mb_trim($value) : ''])
            ->filter(fn (string $value): bool => $value !== '')
            ->all();

        $this->merge([$field => $data !== [] ? $data : null]);
    }
}
