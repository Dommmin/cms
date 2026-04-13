<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\CampaignTriggerEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAutomationRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'trigger' => ['sometimes', 'required', Rule::enum(CampaignTriggerEnum::class)],
            'subject' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'string'],
            'status' => ['sometimes', 'in:draft,ready'],
        ];
    }
}
