<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;

class PromotionController extends Controller
{
    public function index(): JsonResponse
    {
        $promotions = Promotion::active()
            ->ordered()
            ->whereNotNull('metadata')
            ->get()
            ->filter(fn ($p): bool => ! empty($p->metadata['banner_text']))
            ->values()
            ->map(fn ($p): array => [
                'id' => $p->id,
                'name' => $p->name,
                'banner_text' => $p->metadata['banner_text'] ?? null,
                'banner_color' => $p->metadata['banner_color'] ?? null,
                'banner_url' => $p->metadata['banner_url'] ?? null,
                'ends_at' => $p->ends_at?->toISOString(),
            ]);

        return response()->json(['data' => $promotions]);
    }
}
