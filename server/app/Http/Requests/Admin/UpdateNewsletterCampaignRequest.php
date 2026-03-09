<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNewsletterCampaignRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'preview_text' => ['nullable', 'string', 'max:255'],
            'sender_name' => ['nullable', 'string', 'max:255'],
            'sender_email' => ['nullable', 'email', 'max:255'],
            'html_content' => ['required', 'string'],
            'plain_text_content' => ['nullable', 'string'],
            'audience_type' => ['required', 'string', 'in:all,segment,tags'],
            'newsletter_segment_id' => ['nullable', 'exists:newsletter_segments,id'],
            'target_tags' => ['nullable', 'array'],
            'scheduled_at' => ['nullable', 'date'],
        ];
    }
}
