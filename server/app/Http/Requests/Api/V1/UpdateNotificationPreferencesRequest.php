<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationPreferencesRequest extends FormRequest
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
            'preferences' => ['required', 'array'],
            'preferences.*.channel' => ['required', 'string', 'in:email,sms,push'],
            'preferences.*.event' => ['required', 'string', 'in:order_status,return_status,promotions,newsletter,review_response,back_in_stock'],
            'preferences.*.is_enabled' => ['required', 'boolean'],
        ];
    }
}
