<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MediaCropRequest extends FormRequest
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
            'x' => ['required', 'numeric', 'min:0'],
            'y' => ['required', 'numeric', 'min:0'],
            'width' => ['required', 'numeric', 'min:1'],
            'height' => ['required', 'numeric', 'min:1'],
            'rotate' => ['nullable', 'integer', 'in:0,90,180,270'],
            'aspect_ratio' => ['nullable', 'string', 'in:free,1:1,4:3,16:9,3:2,2:3,9:16'],
            'focal_point' => ['nullable', 'array'],
            'focal_point.x' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'focal_point.y' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
