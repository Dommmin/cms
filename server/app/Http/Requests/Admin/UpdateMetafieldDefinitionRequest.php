<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMetafieldDefinitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $definitionId = $this->route('metafield_definition');

        return [
            'owner_type' => ['required', 'string', 'in:App\Models\Product,App\Models\BlogPost,App\Models\Page,App\Models\Category'],
            'namespace' => [
                'required', 'string', 'max:64', 'regex:/^[a-z0-9_]+$/',
                Rule::unique('metafield_definitions')->where(function ($query) {
                    return $query->where('owner_type', $this->input('owner_type'))
                        ->where('key', $this->input('key'));
                })->ignore($definitionId),
            ],
            'key' => ['required', 'string', 'max:64', 'regex:/^[a-z0-9_]+$/'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:string,integer,float,boolean,json,date,datetime,url,color,image,rich_text'],
            'description' => ['nullable', 'string', 'max:1000'],
            'validations' => ['nullable', 'array'],
            'pinned' => ['boolean'],
            'position' => ['integer', 'min:0'],
        ];
    }
}
