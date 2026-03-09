<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupportCannedResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'shortcut' => ['required', 'string', 'max:50', Rule::unique('support_canned_responses', 'shortcut')->ignore($this->route('canned_response'))],
            'body' => ['required', 'string', 'max:5000'],
        ];
    }
}
