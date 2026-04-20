<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Order;
use App\Models\Page;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q = mb_trim($request->string('q')->value());

        if (mb_strlen($q) < 2) {
            return response()->json([]);
        }

        $like = sprintf('%%%s%%', $q);
        $results = [];

        // Products
        Product::query()
            ->where('name', 'LIKE', $like)
            ->orderByDesc('is_active')
            ->limit(5)
            ->get(['id', 'name', 'is_active'])
            ->each(function (Product $p) use (&$results): void {
                $results[] = [
                    'group' => 'Products',
                    'label' => $p->name,
                    'meta' => $p->is_active ? null : 'inactive',
                    'url' => sprintf('/admin/ecommerce/products/%s/edit', $p->id),
                ];
            });

        // Blog Posts
        BlogPost::query()
            ->where('title', 'LIKE', $like)
            ->latest('published_at')
            ->limit(5)
            ->get(['id', 'title', 'status'])
            ->each(function (BlogPost $p) use (&$results): void {
                $results[] = [
                    'group' => 'Blog Posts',
                    'label' => $p->title,
                    'meta' => is_string($p->status) ? $p->status : $p->status?->value,
                    'url' => sprintf('/admin/blog/posts/%s/edit', $p->id),
                ];
            });

        // Pages
        Page::query()
            ->where('title', 'LIKE', $like)
            ->orWhere('slug', 'LIKE', $like)
            ->limit(5)
            ->get(['id', 'title', 'slug'])
            ->each(function (Page $p) use (&$results): void {
                $results[] = [
                    'group' => 'Pages',
                    'label' => $p->title,
                    'meta' => $p->slug,
                    'url' => sprintf('/admin/cms/pages/%d/edit', $p->id),
                ];
            });

        // Orders
        Order::query()
            ->where('reference_number', 'LIKE', $like)
            ->limit(5)
            ->get(['id', 'reference_number', 'status'])
            ->each(function (Order $o) use (&$results): void {
                $results[] = [
                    'group' => 'Orders',
                    'label' => '#'.$o->reference_number,
                    'meta' => $o->status->getValue(),
                    'url' => '/admin/ecommerce/orders/'.$o->id,
                ];
            });

        // Users
        User::query()
            ->where('name', 'LIKE', $like)
            ->orWhere('email', 'LIKE', $like)
            ->limit(5)
            ->get(['id', 'name', 'email'])
            ->each(function (User $u) use (&$results): void {
                $results[] = [
                    'group' => 'Users',
                    'label' => $u->name,
                    'meta' => $u->email,
                    'url' => sprintf('/admin/users/%s/edit', $u->id),
                ];
            });

        return response()->json($results);
    }
}
