<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Services\StorefrontPathService;
use Illuminate\Http\JsonResponse;

class StorefrontRouteController extends ApiController
{
    public function index(StorefrontPathService $pathService): JsonResponse
    {
        return $this->ok([
            'product_listing' => $pathService->productListingPath(),
            'category_listing' => $pathService->categoryListingPath(),
            'brand_listing' => $pathService->brandListingPath(),
            'blog_listing' => $pathService->blogListingPath(),
            'search_results' => $pathService->searchPath(),
            'faq_page' => $pathService->systemPagePath('faq_page'),
            'returns_portal' => $pathService->systemPagePath('returns_portal'),
            'contact_page' => $pathService->systemPagePath('contact_page'),
            'privacy_policy' => $pathService->systemPagePath('privacy_policy'),
            'cookie_policy' => $pathService->systemPagePath('cookie_policy'),
            'terms_of_service' => $pathService->systemPagePath('terms_of_service'),
            'shipping_policy' => $pathService->systemPagePath('shipping_policy'),
            'return_policy' => $pathService->systemPagePath('return_policy'),
        ]);
    }
}
