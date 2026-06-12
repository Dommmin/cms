<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\StoreCategoryRequest;
use App\Http\Requests\Admin\Ecommerce\UpdateCategoryRequest;
use App\Models\Attribute;
use App\Models\Category;
use App\Queries\Admin\CategoryIndexQuery;
use App\Services\SmartCollectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'available_attributes' => $this->availableAttributes(),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] ??= true;
        $schema = $data['attribute_schema'] ?? null;
        unset($data['attribute_schema']);

        DB::transaction(function () use ($data, $schema): void {
            $category = Category::query()->create($data);

            if (is_array($schema)) {
                $this->syncAttributeSchema($category, $schema);
            }
        });

        return to_route('admin.ecommerce.categories.index')->with('success', 'Category created');
    }

    public function edit(Category $category): Response
    {
        $category->load(['parent', 'attributeSchemas.attribute']);

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
            'available_attributes' => $this->availableAttributes(),
            'attribute_schema' => $category->attributeSchemas
                ->map(fn ($schema): array => [
                    'attribute_id' => $schema->attribute_id,
                    'attribute_name' => $schema->attribute->name,
                    'attribute_slug' => $schema->attribute->slug,
                    'is_required' => $schema->is_required,
                    'position' => $schema->position,
                ])
                ->values()
                ->all(),
            'resolved_attribute_schema' => $category->resolvedAttributeSchemas()
                ->map(fn ($schema): array => [
                    'attribute_id' => $schema->attribute_id,
                    'attribute_name' => $schema->attribute->name,
                    'attribute_slug' => $schema->attribute->slug,
                    'is_required' => $schema->is_required,
                    'position' => $schema->position,
                    'is_inherited' => (bool) $schema->getAttribute('is_inherited'),
                    'schema_owner_category_id' => $schema->getAttribute('schema_owner_category_id') ?? $schema->category_id,
                ])
                ->values()
                ->all(),
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();
        $data['is_active'] ??= true;
        $schema = $data['attribute_schema'] ?? null;
        unset($data['attribute_schema']);

        // Clear rules when switching back to manual
        if (($data['collection_type'] ?? 'manual') === 'manual') {
            $data['rules'] = null;
        }

        DB::transaction(function () use ($category, $data, $schema): void {
            $category->update($data);

            if (is_array($schema)) {
                $this->syncAttributeSchema($category, $schema);
            }
        });

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

    /**
     * @return array<int, array{id:int,name:string,slug:string,type:string,is_filterable:bool,is_variant_selection:bool,position:int}>
     */
    private function availableAttributes(): array
    {
        return Attribute::query()
            ->orderBy('position')
            ->orderBy('name')
            ->get()
            ->map(fn (Attribute $attribute): array => [
                'id' => $attribute->id,
                'name' => $attribute->name,
                'slug' => $attribute->slug,
                'type' => $attribute->type->value,
                'is_filterable' => $attribute->is_filterable,
                'is_variant_selection' => $attribute->is_variant_selection,
                'position' => $attribute->position,
            ])
            ->all();
    }

    /**
     * @param  array<int, array{attribute_id:int,is_required?:bool,position?:int}>  $schema
     */
    private function syncAttributeSchema(Category $category, array $schema): void
    {
        $attributeIds = [];

        foreach ($schema as $index => $row) {
            $attributeId = (int) $row['attribute_id'];
            $attributeIds[] = $attributeId;

            $category->attributeSchemas()->updateOrCreate(
                ['attribute_id' => $attributeId],
                [
                    'is_required' => (bool) ($row['is_required'] ?? false),
                    'position' => (int) ($row['position'] ?? $index),
                ]
            );
        }

        if ($attributeIds === []) {
            $category->attributeSchemas()->delete();

            return;
        }

        $category->attributeSchemas()
            ->whereNotIn('attribute_id', $attributeIds)
            ->delete();
    }
}
