<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNewsletterSubscriberRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $subscriber = $this->route('subscriber');

        return [
            'email' => ['required', 'email', 'max:255', 'unique:newsletter_subscribers,email,'.$subscriber?->id],
            'first_name' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
