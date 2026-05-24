<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RteLinkValidateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'urls' => ['required', 'array', 'max:50'],
            'urls.*' => ['required', 'string', 'max:2048'],
        ];
    }
}
