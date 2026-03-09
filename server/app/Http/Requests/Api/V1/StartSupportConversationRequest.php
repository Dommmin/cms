<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StartSupportConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isGuest = ! $this->user();

        return [
            'email' => [$isGuest ? 'required' : 'sometimes', 'nullable', 'email', 'max:255'],
            'name' => [$isGuest ? 'required' : 'sometimes', 'nullable', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:5000'],
            'channel' => ['sometimes', 'string', 'in:widget,email'],
        ];
    }
}
