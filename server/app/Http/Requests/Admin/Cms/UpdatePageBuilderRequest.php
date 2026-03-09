<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePageBuilderRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->has('snapshot')) {
            return [
                'snapshot' => ['required', 'array'],
                'snapshot.sections' => ['sometimes', 'array'],
                'snapshot.sections.*.section_type' => ['required', 'string'],
                'snapshot.sections.*.blocks' => ['sometimes', 'array'],
                'snapshot.sections.*.blocks.*.type' => ['required', 'string'],
                'snapshot.sections.*.blocks.*.configuration' => ['sometimes', 'array'],
            ];
        }

        return [
            'sections' => ['required', 'array'],
            'sections.*.section_type' => ['required', 'string'],
            'sections.*.blocks' => ['sometimes', 'array'],
            'sections.*.blocks.*.type' => ['required', 'string'],
            'sections.*.blocks.*.configuration' => ['sometimes', 'array'],
        ];
    }
}
