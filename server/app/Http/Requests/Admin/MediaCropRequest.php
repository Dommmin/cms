<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

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
            'zoom' => ['nullable', 'numeric', 'min:1', 'max:3'],
            'rotate' => ['nullable', 'integer', 'in:0,90,180,270'],
            'aspect_ratio' => ['nullable', 'string', 'in:free,1:1,4:3,16:9,3:2,2:3,9:16'],
            'focal_point' => ['nullable', 'array'],
            'focal_point.x' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'focal_point.y' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $media = $this->route('media');

            if ($media instanceof Media && ! str_starts_with((string) $media->mime_type, 'image/')) {
                $validator->errors()->add('media', 'Only image media can be cropped.');
            }
        });
    }
}
