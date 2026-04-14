<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SyncMetafieldsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'metafields' => ['required', 'array'],
            'metafields.*.namespace' => ['required', 'string', 'max:64'],
            'metafields.*.key' => ['required', 'string', 'max:64'],
            'metafields.*.type' => ['required', 'string', 'in:string,integer,float,boolean,json,date,datetime,url,color,image,rich_text'],
            'metafields.*.value' => ['nullable'],
            'metafields.*._delete' => ['boolean'],
        ];
    }
}
