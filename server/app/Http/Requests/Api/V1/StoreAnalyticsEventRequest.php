<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnalyticsEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'session_id' => ['required', 'string', 'max:255'],
            'event_name' => ['required', 'string', 'in:impression,view_item,add_to_cart,begin_checkout,payment_step,purchase'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'url' => ['nullable', 'string', 'max:2048'],
            'referrer' => ['nullable', 'string', 'max:2048'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
