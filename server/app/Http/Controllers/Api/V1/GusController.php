<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Services\GusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class GusController extends ApiController
{
    public function __construct(private readonly GusService $gusService) {}

    /**
     * Look up a company by NIP and return pre-filled address data.
     *
     * GET /api/v1/gus/nip/{nip}
     */
    public function lookupByNip(string $nip): JsonResponse
    {
        try {
            $data = $this->gusService->lookupByNip($nip);
        } catch (RuntimeException $runtimeException) {
            throw ValidationException::withMessages([
                'nip' => [$runtimeException->getMessage()],
            ]);
        }

        return $this->ok($data);
    }
}
