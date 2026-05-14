<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use App\Services\PageBuilder\PageBuilderSnapshotValidator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;

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
                $snapshot = app(PageBuilderSnapshotValidator::class)->validateAndSanitize(
                    $this->input('snapshot'),
                );
            } catch (ValidationException $exception) {
                foreach ($exception->errors() as $attribute => $messages) {
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
