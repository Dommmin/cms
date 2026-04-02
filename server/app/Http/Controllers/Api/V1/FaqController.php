<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\FaqResource;
use App\Models\Faq;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FaqController extends ApiController
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $faqs = Faq::query()
            ->where('is_active', true)
            ->when($request->category, fn ($q, $cat) => $q->where('category', $cat))
            ->orderBy('position')
            ->get();

        return $this->collection(FaqResource::collection($faqs));
    }
}
