<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTranslationRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'locale_code' => ['required', 'string', 'exists:locales,code'],
            'group' => ['required', 'string', 'max:50'],
            'key' => ['required', 'string', 'max:100'],
            'value' => ['required', 'string'],
        ];
    }
}
