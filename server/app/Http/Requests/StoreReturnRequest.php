<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ReturnTypeEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

/**
 * @property int $order_id
 * @property string $return_type
 * @property string $reason
 * @property string|null $customer_notes
 * @property array<int, array{order_item_id: int, quantity: int, condition?: string|null, notes?: string|null}> $items
 */
class StoreReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, Enum|\Illuminate\Contracts\Validation\Rule|ValidationRule|string>>
     */
    public function rules(): array
    {
        return [
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'return_type' => ['required', 'string', Rule::enum(ReturnTypeEnum::class)],
            'reason' => ['required', 'string', 'max:2000'],
            'customer_notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.order_item_id' => ['required', 'integer', 'exists:order_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.condition' => ['nullable', 'string', 'max:50'],
            'items.*.notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
