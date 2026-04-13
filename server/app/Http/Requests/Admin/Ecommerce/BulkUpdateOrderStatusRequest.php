<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use App\Enums\OrderStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkUpdateOrderStatusRequest extends FormRequest
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
        return [
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['integer', 'exists:orders,id'],
            'status' => ['required', 'string', Rule::enum(OrderStatusEnum::class)],
        ];
    }
}
