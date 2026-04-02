<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;

class BrandController extends ApiController
{
    public function index(): JsonResponse
    {
        $brands = Brand::active()
            ->orderBy('position')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo_path']);

        return $this->ok($brands->toArray());
    }
}
