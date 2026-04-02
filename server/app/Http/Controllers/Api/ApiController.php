<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Base controller for all API controllers.
 *
 * Always use these methods instead of calling response()->json() directly.
 * JsonResource::withoutWrapping() is set globally, so returning a Resource
 * or collection directly will render the model data without the { data: T } wrapper.
 *
 * Rules:
 *  - Never call response()->json() in API controllers
 *  - Use ok() / created() / noContent() for all responses
 *  - ok() / created() always take a JsonResource or array; they force the
 *    correct status code regardless of model->wasRecentlyCreated
 */
abstract class ApiController extends Controller
{
    /**
     * 200 OK — single resource or plain data.
     */
    protected function ok(JsonResource|array $data): JsonResponse
    {
        if ($data instanceof JsonResource) {
            return $data->response()->setStatusCode(200);
        }

        return new JsonResponse($data, 200);
    }

    /**
     * 201 Created — newly created resource.
     */
    protected function created(JsonResource|array $data): JsonResponse
    {
        if ($data instanceof JsonResource) {
            return $data->response()->setStatusCode(201);
        }

        return new JsonResponse($data, 201);
    }

    /**
     * 204 No Content — successful action with no body.
     */
    protected function noContent(): JsonResponse
    {
        return new JsonResponse(null, 204);
    }

    /**
     * Collection (paginated or plain) returned as-is.
     * Paginated collections already carry their own status (200).
     */
    protected function collection(AnonymousResourceCollection $collection): AnonymousResourceCollection
    {
        return $collection;
    }
}
