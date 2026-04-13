<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\StoreConsentRequest;
use App\Models\CookieConsent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsentController extends ApiController
{
    /**
     * GDPR Art. 7 — Returns current consent choices for the user or session.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->header('X-Session-ID');

        $query = CookieConsent::query();

        if ($userId) {
            $query->where('user_id', $userId);
        } elseif ($sessionId) {
            $query->where('session_id', $sessionId);
        } else {
            return $this->ok([
                'functional' => true,
                'analytics' => false,
                'marketing' => false,
                'consent_version' => null,
            ]);
        }

        $consents = $query->latest()->get()->keyBy('category');

        return $this->ok([
            'functional' => true,
            'analytics' => (bool) ($consents->get('analytics')?->granted ?? false),
            'marketing' => (bool) ($consents->get('marketing')?->granted ?? false),
            'consent_version' => $consents->first()?->consent_version,
        ]);
    }

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

        return $this->created(['message' => 'Consent recorded.']);
    }

    /**
     * GDPR Art. 7 — Withdraw consent for a specific category.
     */
    public function withdraw(Request $request, string $category): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->header('X-Session-ID');

        $query = CookieConsent::query()->where('category', $category);

        if ($userId) {
            $query->where('user_id', $userId);
        } elseif ($sessionId) {
            $query->where('session_id', $sessionId);
        } else {
            return $this->noContent();
        }

        $query->update(['granted' => false]);

        return $this->noContent();
    }
}
