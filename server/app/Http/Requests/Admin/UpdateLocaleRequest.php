<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLocaleRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:10', Rule::unique('locales', 'code')->ignore($this->route('locale'))],
            'name' => ['required', 'string', 'max:100'],
            'native_name' => ['required', 'string', 'max:100'],
            'flag_emoji' => ['nullable', 'string', 'max:10'],
            'is_default' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
