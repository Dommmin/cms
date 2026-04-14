<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Concerns\HasMetafields;
use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\MetafieldResource;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class MetafieldController extends ApiController
{
    /** @var array<string, class-string<Model>> */
    private array $allowedTypes = [
        'product' => Product::class,
        'blog-post' => BlogPost::class,
        'page' => Page::class,
        'category' => Category::class,
    ];

    public function forResource(Request $request, string $type, int $id): JsonResponse
    {
        if (! isset($this->allowedTypes[$type])) {
            throw new NotFoundHttpException("Unknown resource type: {$type}");
        }

        /** @var class-string<Model> $modelClass */
        $modelClass = $this->allowedTypes[$type];

        /** @var (Model&HasMetafields) $model */
        $model = $modelClass::query()->findOrFail($id);

        return $this->ok(
            MetafieldResource::collection($model->metafields()->get())
        );
    }
}
