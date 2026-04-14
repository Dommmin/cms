<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Concerns\HasMetafields;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SyncMetafieldsRequest;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class MetafieldController extends Controller
{
    public function sync(SyncMetafieldsRequest $request, string $type, int $id): RedirectResponse
    {
        $model = $this->resolveModel($type, $id);

        /** @var HasMetafields $model */
        $model->syncMetafields($request->input('metafields', []));

        return back()->with('success', 'Metafields saved successfully');
    }

    private function resolveModel(string $type, int $id): Model
    {
        $map = [
            'product' => Product::class,
            'blog-post' => BlogPost::class,
            'page' => Page::class,
            'category' => Category::class,
        ];

        throw_unless(isset($map[$type]), NotFoundHttpException::class, 'Unknown resource type: '.$type);

        /** @var class-string<Model> $modelClass */
        $modelClass = $map[$type];

        return $modelClass::query()->findOrFail($id);
    }
}
