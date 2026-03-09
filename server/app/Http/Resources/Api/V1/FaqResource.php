<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\Faq;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Faq
 */
class FaqResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var Faq $faq */
        $faq = $this->resource;

        return [
            'id' => $faq->id,
            'question' => $faq->question,
            'answer' => $faq->answer,
            'category' => $faq->category,
            'position' => $faq->position,
        ];
    }
}
