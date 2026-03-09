<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', \Illuminate\Validation\Rule::enum(\App\Enums\OrderStatusEnum::class)],
            'notes' => ['nullable', 'string', 'max:500'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
        ];
    }
}
