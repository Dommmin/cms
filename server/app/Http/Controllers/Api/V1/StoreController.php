<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\StoreResource;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StoreController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $stores = Store::query()->active()->get();

        return StoreResource::collection($stores);
    }

    public function show(Store $store): StoreResource|JsonResponse
    {
        if (! $store->is_active) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return new StoreResource($store);
    }
}
