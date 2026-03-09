<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\FaqResource;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $faqs = Faq::query()
            ->where('is_active', true)
            ->when($request->category, fn ($q, $cat) => $q->where('category', $cat))
            ->orderBy('position')
            ->get();

        return response()->json([
            'data' => FaqResource::collection($faqs),
        ]);
    }
}
