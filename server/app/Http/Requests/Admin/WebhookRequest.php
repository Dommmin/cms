<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Rules\WebhookTargetUrlRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

abstract class WebhookRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:2048', new WebhookTargetUrlRule()],
            'description' => ['nullable', 'string', 'max:1000'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['required', 'string', 'in:'.implode(',', $this->availableEvents())],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<int, string>
     */
    protected function availableEvents(): array
    {
        return [
            'order.created',
            'order.paid',
            'order.cancelled',
            'order.shipped',
            'order.delivered',
            'customer.created',
            'customer.updated',
            'page.published',
            'page.unpublished',
            'product.created',
            'product.updated',
            'product.deleted',
            'product.published',
            'product.unpublished',
            'blog_post.published',
            'blog_post.unpublished',
            'return.requested',
            'return.approved',
        ];
    }
}
