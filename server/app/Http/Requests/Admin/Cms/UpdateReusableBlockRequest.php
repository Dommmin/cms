<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use App\Models\ReusableBlock;

class UpdateReusableBlockRequest extends StoreReusableBlockRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = parent::rules();
        unset($rules['type']);

        $rules['is_active'] = ['boolean'];

        return $rules;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('type')) {
            $reusableBlock = $this->route('reusableBlock') ?? $this->route('reusable_block');

            if ($reusableBlock instanceof ReusableBlock) {
                $this->merge(['type' => $reusableBlock->type]);
            }
        }
    }
}
