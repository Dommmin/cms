<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreLocaleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:10', 'unique:locales,code'],
            'name' => ['required', 'string', 'max:100'],
            'native_name' => ['required', 'string', 'max:100'],
            'flag_emoji' => ['nullable', 'string', 'max:10'],
            'currency_code' => ['nullable', 'string', 'max:3', 'exists:currencies,code'],
            'is_default' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
