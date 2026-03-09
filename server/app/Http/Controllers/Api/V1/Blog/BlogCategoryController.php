<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Blog;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BlogCategoryResource;
use App\Models\BlogCategory;
use Illuminate\Http\JsonResponse;

class BlogCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = BlogCategory::active()
            ->roots()
            ->withCount(['posts' => fn ($q) => $q->published()])
            ->orderBy('position')
            ->get();

        return response()->json(['data' => BlogCategoryResource::collection($categories)]);
    }
}
