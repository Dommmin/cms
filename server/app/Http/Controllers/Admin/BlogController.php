<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Blog\StoreBlogRequest;
use App\Http\Requests\Admin\Blog\UpdateBlogRequest;
use App\Models\Blog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $blogs = Blog::query()
            ->withCount('posts')
            ->when($request->input('search'), function ($query, string $search): void {
                $query->where('slug', 'like', sprintf('%%%s%%', $search));
            })
            ->orderBy('position')
            ->orderBy('id')
            ->paginate(20);

        return inertia('admin/blogs/index', [
            'blogs' => $blogs,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/blogs/create', [
            'users' => User::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreBlogRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['slug'])) {
            $nameEn = is_array($data['name']) ? ($data['name']['en'] ?? '') : (string) $data['name'];
            $data['slug'] = Str::slug($nameEn);
        }

        $blog = Blog::query()->create($data);

        return to_route('admin.blogs.edit', $blog)->with('success', 'Blog created successfully');
    }

    public function edit(Blog $blog): Response
    {
        $blog->loadCount('posts');

        return inertia('admin/blogs/edit', [
            'blog' => array_merge($blog->toArray(), [
                'name' => $blog->getTranslations('name'),
                'description' => $blog->getTranslations('description'),
            ]),
            'users' => User::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateBlogRequest $request, Blog $blog): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['slug'])) {
            $nameEn = is_array($data['name']) ? ($data['name']['en'] ?? '') : (string) $data['name'];
            $data['slug'] = Str::slug($nameEn);
        }

        $blog->update($data);

        return back()->with('success', 'Blog updated successfully');
    }

    public function destroy(Blog $blog): RedirectResponse
    {
        $blog->delete();

        return to_route('admin.blogs.index')->with('success', 'Blog deleted successfully');
    }
}
