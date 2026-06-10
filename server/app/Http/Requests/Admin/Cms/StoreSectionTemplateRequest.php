<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use App\Services\PageBuilder\PageBuilderSnapshotValidator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class StoreSectionTemplateRequest extends FormRequest
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
            'description' => ['nullable', 'string', 'max:1000'],
            'category' => ['required', 'string', 'in:custom,landing,product,blog,portfolio,other'],
            'is_global' => ['boolean'],
            'snapshot' => ['required', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty() || ! is_array($this->input('snapshot'))) {
                return;
            }

            try {
                $snapshot = resolve(PageBuilderSnapshotValidator::class)->validateAndSanitize(
                    $this->input('snapshot'),
                    user: $this->user(),
                );
            } catch (ValidationException $validationException) {
                foreach ($validationException->errors() as $attribute => $messages) {
                    foreach ($messages as $message) {
                        $validator->errors()->add($attribute, $message);
                    }
                }

                return;
            }

            $this->merge(['snapshot' => $snapshot]);
        });
    }
}
