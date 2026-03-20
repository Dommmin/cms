<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CloneSiteRequest extends FormRequest
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
        $localeCodes = \App\Models\Locale::pluck('code')->toArray();
        $sourceOptions = array_merge(['global'], $localeCodes);

        return [
            'source_locale' => ['required', 'string', Rule::in($sourceOptions)],
            'target_locale' => ['required', 'string', Rule::in($localeCodes), 'different:source_locale'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'target_locale.different' => 'The target locale must be different from the source locale.',
        ];
    }
}
