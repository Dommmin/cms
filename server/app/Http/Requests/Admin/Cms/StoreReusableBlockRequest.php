<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use App\Services\PageBuilder\BlockConfigurationValidator;
use App\Services\PageBuilder\PageBuilderSnapshotValidator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StoreReusableBlockRequest extends FormRequest
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
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['required', 'string', Rule::in(array_keys((array) config('blocks.block_types', [])))],
            'configuration' => ['nullable', 'array'],
            'relations_config' => ['nullable', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $this->validateBlockPayload($validator);
        });
    }

    private function validateBlockPayload(Validator $validator): void
    {
        try {
            $configuration = resolve(BlockConfigurationValidator::class)->validateAndSanitize(
                $this->string('type')->toString(),
                $this->input('configuration', []),
                'configuration',
                $this->user(),
            );

            resolve(PageBuilderSnapshotValidator::class)->validateRelationsForBlock(
                $this->string('type')->toString(),
                $this->input('relations_config', []),
                'relations_config',
            );
        } catch (ValidationException $validationException) {
            foreach ($validationException->errors() as $attribute => $messages) {
                foreach ($messages as $message) {
                    $validator->errors()->add($attribute, $message);
                }
            }

            return;
        }

        $this->merge(['configuration' => $configuration]);
    }
}
