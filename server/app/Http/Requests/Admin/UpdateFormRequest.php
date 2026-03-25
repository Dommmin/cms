<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateFormRequest extends FormRequest
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
        $form = $this->route('form');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:forms,slug,'.$form?->id],
            'description' => ['nullable', 'string'],
            'notify_emails' => ['nullable', 'array'],
            'notify_emails.*' => ['email'],
            'is_active' => ['sometimes', 'boolean'],
            'fields' => ['sometimes', 'array'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.name' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9_]+$/'],
            'fields.*.type' => ['required', 'string', 'in:text,email,number,tel,url,textarea,select,radio,checkbox,file,date'],
            'fields.*.placeholder' => ['nullable', 'string', 'max:255'],
            'fields.*.is_required' => ['sometimes', 'boolean'],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.options.*' => ['string', 'max:255'],
        ];
    }
}
