<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Cms\StoreSectionTemplateRequest;
use App\Models\SectionTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SectionTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;

        $templates = SectionTemplate::query()
            ->where(function ($query) use ($userId): void {
                $query->where('is_global', true)
                    ->orWhere('created_by', $userId);
            })
            ->orderBy('name')
            ->get();

        return response()->json($templates);
    }

    public function store(StoreSectionTemplateRequest $request): JsonResponse
    {
        $template = SectionTemplate::query()->create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'category' => $request->input('category', 'custom'),
            'is_global' => $request->boolean('is_global', false),
            'snapshot' => $request->input('snapshot'),
            'created_by' => $request->user()?->id,
            'usage_count' => 0,
        ]);

        return response()->json($template, 201);
    }

    public function destroy(Request $request, SectionTemplate $sectionTemplate): JsonResponse
    {
        $userId = $request->user()?->id;

        if ($sectionTemplate->created_by !== $userId && ! $request->user()?->hasRole('super-admin')) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $sectionTemplate->delete();

        return response()->json(['message' => 'Template deleted.']);
    }

    public function incrementUsage(SectionTemplate $sectionTemplate): JsonResponse
    {
        $sectionTemplate->increment('usage_count');

        return response()->json(['usage_count' => $sectionTemplate->usage_count]);
    }
}
