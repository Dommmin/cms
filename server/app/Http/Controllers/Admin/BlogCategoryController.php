<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogCategoryRequest;
use App\Http\Requests\Admin\UpdateBlogCategoryRequest;
use App\Models\BlogCategory;
use App\Queries\Admin\BlogCategoryIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Response;

class BlogCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categoryQuery = new BlogCategoryIndexQuery;
        $categories = $categoryQuery->paginate($request->only(['search', 'is_active', 'per_page']));

        return inertia('admin/blog/categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        $categoryQuery = new BlogCategoryIndexQuery;

        return inertia('admin/blog/categories/create', [
            'parentCategories' => $categoryQuery->categoriesForSelect(),
        ]);
    }

    public function store(StoreBlogCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $data['is_active'] = $data['is_active'] ?? true;
        $data['position'] = $data['position'] ?? 0;

        BlogCategory::create($data);

        return redirect()->route('admin.blog.categories.index')->with('success', 'Blog category created successfully');
    }

    public function edit(BlogCategory $category): Response
    {
        $categoryQuery = new BlogCategoryIndexQuery;

        return inertia('admin/blog/categories/edit', [
            'category' => $category->load('parent'),
            'parentCategories' => $categoryQuery->categoriesForSelect(),
        ]);
    }

    public function update(UpdateBlogCategoryRequest $request, BlogCategory $category): RedirectResponse
    {
        $data = $request->validated();

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        $category->update($data);

        return redirect()->back()->with('success', 'Blog category updated successfully');
    }

    public function destroy(BlogCategory $category): RedirectResponse
    {
        $category->delete();

        return redirect()->back()->with('success', 'Blog category deleted successfully');
    }
}
