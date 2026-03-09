<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreCategoryRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateCategoryRequest;
use App\Models\Category;
use App\Queries\Admin\CategoryIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CategoryController extends Controller
{
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
        $data['is_active'] = $data['is_active'] ?? true;
        Category::create($data);

        return redirect()->route('admin.ecommerce.categories.index')->with('success', 'Category created');
    }

    public function edit(Category $category): Response
    {
        $category->load('parent');

        $categoryQuery = new CategoryIndexQuery(request());
        $categories = $categoryQuery->getCategoriesForParentSelection($category->id);

        return inertia('admin/ecommerce/categories/edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->getTranslations('name'),
                'slug' => $category->slug,
                'description' => $category->getTranslations('description'),
                'parent_id' => $category->parent_id,
                'is_active' => $category->is_active,
            ],
            'categories' => $categories,
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] = $data['is_active'] ?? true;
        $category->update($data);

        return redirect()->route('admin.ecommerce.categories.index')->with('success', 'Category updated');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->children()->count() > 0) {
            return redirect()->back()->withErrors(['delete' => 'Cannot delete category with subcategories']);
        }

        $category->delete();

        return redirect()->back()->with('success', 'Category deleted');
    }

    private function buildCategoryTree($categories, $parentId = null, $depth = 0): array
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
            $child = Category::find($childId);
            if ($child && $this->isDescendant($child, $parentId)) {
                return true;
            }
        }

        return false;
    }
}
