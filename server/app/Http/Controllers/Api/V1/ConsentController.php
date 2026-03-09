<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreConsentRequest;
use App\Models\CookieConsent;
use Illuminate\Http\JsonResponse;

class ConsentController extends Controller
{
    public function store(StoreConsentRequest $request): JsonResponse
    {
        $data = $request->validated();

        $categories = [
            'functional' => true,
            'analytics' => $data['analytics'],
            'marketing' => $data['marketing'],
        ];

        $sessionId = $data['session_id'] ?? null;
        $consentVersion = $data['consent_version'] ?? null;
        $ip = $request->ip();
        $userAgent = $request->userAgent();
        $userId = $request->user()?->id;

        foreach ($categories as $category => $granted) {
            CookieConsent::query()->create([
                'session_id' => $sessionId,
                'user_id' => $userId,
                'category' => $category,
                'granted' => $granted,
                'ip' => $ip,
                'user_agent' => $userAgent,
                'consent_version' => $consentVersion,
            ]);
        }

        return response()->json(['message' => 'Consent recorded.'], 201);
    }
}
