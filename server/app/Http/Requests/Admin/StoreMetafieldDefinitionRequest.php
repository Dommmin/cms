<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMetafieldDefinitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'owner_type' => ['required', 'string', 'in:App\Models\Product,App\Models\BlogPost,App\Models\Page,App\Models\Category'],
            'namespace' => ['required', 'string', 'max:64', 'regex:/^[a-z0-9_]+$/'],
            'key' => ['required', 'string', 'max:64', 'regex:/^[a-z0-9_]+$/'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:string,integer,float,boolean,json,date,datetime,url,color,image,rich_text'],
            'visibility' => ['required', 'string', 'in:private,admin_only,storefront'],
            'storefront_exposed' => ['boolean'],
            'description' => ['nullable', 'string', 'max:1000'],
            'validations' => ['nullable', 'array'],
            'pinned' => ['boolean'],
            'position' => ['integer', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'visibility' => $this->input('visibility', 'admin_only'),
            'storefront_exposed' => filter_var($this->input('storefront_exposed', false), FILTER_VALIDATE_BOOL),
        ]);
    }
}
