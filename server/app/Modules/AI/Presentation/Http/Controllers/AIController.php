<?php

declare(strict_types=1);

namespace App\Modules\AI\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\AI\Domain\Interfaces\AIServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AI Controller
 * Handles AI content generation requests
 */
final class AIController extends Controller
{
    public function __construct(
        private readonly AIServiceInterface $aiService
    ) {}

    /**
     * POST /api/ai/generate-content
     */
    public function generateContent(Request $request): JsonResponse
    {
        $request->validate([
            'prompt' => 'required|string',
            'context' => 'array',
        ]);

        $content = $this->aiService->generateContent(
            $request->prompt,
            $request->context ?? []
        );

        return response()->json(['content' => $content]);
    }

    /**
     * POST /api/ai/generate-module
     */
    public function generateModule(Request $request): JsonResponse
    {
        $request->validate([
            'module_name' => 'required|string',
            'requirements' => 'required|array',
        ]);

        $module = $this->aiService->generateModule(
            $request->module_name,
            $request->requirements
        );

        return response()->json($module);
    }

    /**
     * POST /api/ai/generate-product-description
     */
    public function generateProductDescription(Request $request): JsonResponse
    {
        $request->validate([
            'product_data' => 'required|array',
            'product_data.name' => 'required|string',
            'product_data.category' => 'required|string',
        ]);

        $description = $this->aiService->generateProductDescription(
            $request->product_data
        );

        return response()->json(['description' => $description]);
    }

    /**
     * POST /api/ai/generate-policy
     */
    public function generatePolicy(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string|in:privacy,terms,cookies',
            'context' => 'required|array',
        ]);

        $policy = $this->aiService->generatePolicy(
            $request->type,
            $request->context
        );

        return response()->json(['policy' => $policy]);
    }
}

