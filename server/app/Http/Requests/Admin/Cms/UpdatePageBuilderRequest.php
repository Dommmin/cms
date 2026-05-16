<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use App\Models\Page;
use App\Services\PageBuilder\PageBuilderSnapshotValidator;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;

class UpdatePageBuilderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $page = Page::query()->find($this->route('page'));

        if (! $page) {
            return false;
        }

        return $this->user()?->can('update', $page) ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'snapshot' => ['required', 'array'],
            'expected_version' => ['sometimes', 'nullable', 'integer'],
        ];
    }

    /**
     * Delegate the full Page Builder contract to the shared snapshot validator.
     */
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
