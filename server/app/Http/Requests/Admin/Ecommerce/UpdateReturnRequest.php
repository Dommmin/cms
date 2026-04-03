<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use App\Enums\ReturnStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(ReturnStatusEnum::class)],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'refund_amount' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
