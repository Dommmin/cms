<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        $brands = Brand::active()
            ->orderBy('position')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo_path']);

        return response()->json(['data' => $brands]);
    }
}
