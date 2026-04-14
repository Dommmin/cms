<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends ApiController
{
    /** @var array<string, string> */
    private const array TYPE_MAP = [
        'blog-post' => BlogPost::class,
        'product' => Product::class,
        'page' => Page::class,
        'category' => Category::class,
    ];

    public function index(Request $request): JsonResponse
    {
        $type = $request->string('type')->toString();

        $query = Tag::query()->orderBy('name');

        if ($type !== '' && array_key_exists($type, self::TYPE_MAP)) {
            $morphType = self::TYPE_MAP[$type];

            $query->whereExists(function ($sub) use ($morphType): void {
                $sub->from('taggables')
                    ->whereColumn('taggables.tag_id', 'tags.id')
                    ->where('taggables.taggable_type', $morphType);
            });
        }

        $tags = $query->get(['id', 'name', 'slug']);

        return $this->ok($tags->toArray());
    }
}
