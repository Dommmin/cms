<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\V1\MenuResource;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;

class MenuController extends ApiController
{
    public function show(string $location): JsonResponse
    {
        $menu = Menu::query()
            ->where('location', $location)
            ->with(['items' => fn ($q) => $q->orderBy('position'), 'items.children' => fn ($q) => $q->orderBy('position')])
            ->first();

        abort_unless($menu !== null, 404);

        return $this->ok(new MenuResource($menu));
    }
}
