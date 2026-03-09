<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTranslationRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'value' => ['required', 'string'],
        ];
    }
}
