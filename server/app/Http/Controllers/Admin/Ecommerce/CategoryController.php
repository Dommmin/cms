<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreCategoryRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateCategoryRequest;
use App\Models\Category;
use App\Queries\Admin\CategoryIndexQuery;
use App\Services\SmartCollectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(private readonly SmartCollectionService $smartCollectionService) {}

    public function index(Request $request): Response
    {
        $categoryQuery = new CategoryIndexQuery($request);
        $categories = $categoryQuery->execute();

        return inertia('admin/ecommerce/categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'parent_id', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        $categoryQuery = new CategoryIndexQuery(request());
        $categories = $categoryQuery->getAllCategories();

        return inertia('admin/ecommerce/categories/create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] ??= true;
        Category::query()->create($data);

        return to_route('admin.ecommerce.categories.index')->with('success', 'Category created');
    }

    public function edit(Category $category): Response
    {
        $category->load('parent');

        $categoryQuery = new CategoryIndexQuery(request());
        $categories = $categoryQuery->getCategoriesForParentSelection($category->id);

        $smartProductCount = $category->isSmartCollection()
            ? $this->smartCollectionService->countMatchingProducts($category)
            : 0;

        return inertia('admin/ecommerce/categories/edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->getTranslations('name'),
                'slug' => $category->slug,
                'description' => $category->getTranslations('description'),
                'parent_id' => $category->parent_id,
                'is_active' => $category->is_active,
                'collection_type' => $category->collection_type ?? 'manual',
                'rules' => $category->rules ?? [],
                'rules_match' => $category->rules_match ?? 'all',
                'seo_title' => $category->seo_title,
                'seo_description' => $category->seo_description,
                'meta_robots' => $category->meta_robots,
                'og_image' => $category->og_image,
                'sitemap_exclude' => $category->sitemap_exclude,
            ],
            'categories' => $categories,
            'smart_product_count' => $smartProductCount,
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] ??= true;

        // Clear rules when switching back to manual
        if (($data['collection_type'] ?? 'manual') === 'manual') {
            $data['rules'] = null;
        }

        $category->update($data);

        return to_route('admin.ecommerce.categories.index')->with('success', 'Category updated');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->children()->count() > 0) {
            return back()->withErrors(['delete' => 'Cannot delete category with subcategories']);
        }

        $category->delete();

        return back()->with('success', 'Category deleted');
    }

    private function buildCategoryTree($categories, $parentId = null, int|float $depth = 0): array
    {
        $result = [];

        foreach ($categories as $category) {
            if ($category->parent_id === $parentId) {
                $result[] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'is_active' => $category->is_active,
                    'parent_id' => $category->parent_id,
                    'parent' => $category->parent ? [
                        'id' => $category->parent->id,
                        'name' => $category->parent->name,
                    ] : null,
                    'products_count' => $category->products_count,
                    'depth' => $depth,
                ];

                $children = $this->buildCategoryTree($categories, $category->id, $depth + 1);
                $result = array_merge($result, $children);
            }
        }

        return $result;
    }

    private function isDescendant(Category $category, int $parentId): bool
    {
        $children = $category->children()->pluck('id')->toArray();

        if (in_array($parentId, $children)) {
            return true;
        }

        foreach ($children as $childId) {
            $child = Category::query()->find($childId);
            if ($child && $this->isDescendant($child, $parentId)) {
                return true;
            }
        }

        return false;
    }
}
