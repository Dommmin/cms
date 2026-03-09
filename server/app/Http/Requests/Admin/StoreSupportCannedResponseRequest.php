<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupportCannedResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'shortcut' => ['required', 'string', 'max:50', Rule::unique('support_canned_responses', 'shortcut')],
            'body' => ['required', 'string', 'max:5000'],
        ];
    }
}
