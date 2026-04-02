<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Resources\Api\StoreResource;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StoreController extends ApiController
{
    public function index(): AnonymousResourceCollection
    {
        $stores = Store::query()->active()->get();

        return StoreResource::collection($stores);
    }

    public function show(Store $store): JsonResponse
    {
        if (! $store->is_active) {
            abort(404);
        }

        return $this->ok(new StoreResource($store));
    }
}
