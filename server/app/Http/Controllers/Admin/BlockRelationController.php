<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Faq;
use App\Models\Form;
use App\Models\Menu;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockRelationController extends Controller
{
    /**
     * Search entities by relation type.
     */
    public function search(Request $request): JsonResponse
    {
        $type = $request->string('type')->toString();
        $query = $request->string('q')->toString();

        $results = match ($type) {
            'category' => Category::query()
                ->when($query, fn ($q) => $q->where('name', 'like', sprintf('%%%s%%', $query)))
                ->orderBy('name')
                ->limit(20)
                ->get(['id', 'name'])
                ->map(fn ($item): array => ['id' => $item->id, 'name' => $item->getTranslation('name', 'en')]),

            'product' => Product::query()
                ->when($query, fn ($q) => $q->where('name', 'like', sprintf('%%%s%%', $query)))
                ->orderBy('name')
                ->limit(20)
                ->get(['id', 'name'])
                ->map(fn ($item): array => ['id' => $item->id, 'name' => $item->getTranslation('name', 'en')]),

            'brand' => Brand::query()
                ->when($query, fn ($q) => $q->where('name', 'like', sprintf('%%%s%%', $query)))
                ->orderBy('name')
                ->limit(20)
                ->get(['id', 'name']),

            'page' => Page::query()
                ->when($query, fn ($q) => $q->where('title', 'like', sprintf('%%%s%%', $query)))
                ->orderBy('title')
                ->limit(20)
                ->get(['id', 'title'])
                ->map(fn ($item): array => ['id' => $item->id, 'name' => $item->getTranslation('title', 'en')]),

            'menu' => Menu::query()
                ->when($query, fn ($q) => $q->where('name', 'like', sprintf('%%%s%%', $query)))
                ->orderBy('name')
                ->limit(20)
                ->get(['id', 'name']),

            'form' => Form::query()
                ->when($query, fn ($q) => $q->where('name', 'like', sprintf('%%%s%%', $query)))
                ->orderBy('name')
                ->limit(20)
                ->get(['id', 'name']),

            'faq' => Faq::query()
                ->when($query, fn ($q) => $q->where('question', 'like', sprintf('%%%s%%', $query)))
                ->orderBy('question')
                ->limit(20)
                ->get(['id', 'question as name']),

            'blog_post' => BlogPost::query()
                ->when($query, fn ($q) => $q->where('title', 'like', sprintf('%%%s%%', $query)))
                ->latest('published_at')
                ->limit(20)
                ->get(['id', 'title'])
                ->map(fn ($item): array => ['id' => $item->id, 'name' => $item->getTranslation('title', 'en')]),

            'blog_category' => BlogCategory::query()
                ->when($query, fn ($q) => $q->where('name', 'like', sprintf('%%%s%%', $query)))
                ->orderBy('name')
                ->limit(20)
                ->get(['id', 'name']),

            default => collect(),
        };

        return response()->json($results);
    }
}
