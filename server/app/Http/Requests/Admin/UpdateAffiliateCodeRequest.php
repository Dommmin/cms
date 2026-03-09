<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAffiliateCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $codeId = $this->route('code')?->id;

        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'code' => ['required', 'string', 'max:50', "unique:affiliate_codes,code,{$codeId}", 'regex:/^[A-Z0-9_-]+$/'],
            'discount_type' => ['required', 'string', 'in:percentage,fixed,none'],
            'discount_value' => ['required', 'integer', 'min:0', 'max:100000'],
            'commission_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'expires_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
