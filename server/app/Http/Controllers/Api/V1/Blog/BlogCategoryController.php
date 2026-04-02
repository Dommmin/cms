<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Blog;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\BlogCategoryResource;
use App\Models\BlogCategory;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BlogCategoryController extends ApiController
{
    public function index(): AnonymousResourceCollection
    {
        $categories = BlogCategory::query()->active()
            ->roots()
            ->withCount(['posts' => fn ($q) => $q->published()])
            ->orderBy('position')
            ->get();

        return BlogCategoryResource::collection($categories);
    }
}
