<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use App\Enums\SlotLocationEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGlobalSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'location' => ['sometimes', 'required', 'string', Rule::enum(SlotLocationEnum::class)],
            'reusable_block_id' => ['nullable', 'exists:reusable_blocks,id'],
            'label' => ['sometimes', 'required', 'string', 'max:255'],
            'configuration' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'required', 'boolean'],
            'position' => ['sometimes', 'required', 'integer', 'min:0'],
            'settings' => ['nullable', 'array'],
        ];
    }
}
