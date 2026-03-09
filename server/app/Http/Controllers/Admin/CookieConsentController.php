<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CookieConsent;
use App\Queries\Admin\CookieConsentIndexQuery;
use Illuminate\Http\Request;
use Inertia\Response;

class CookieConsentController extends Controller
{
    public function index(Request $request): Response
    {
        $consentQuery = new CookieConsentIndexQuery($request);
        $consents = $consentQuery->execute();
        $stats = $consentQuery->getStats();

        return inertia('admin/cookie-consents/index', [
            'consents' => $consents,
            'stats' => $stats,
            'filters' => $request->only(['search', 'granted', 'date_from', 'date_to']),
        ]);
    }

    public function show(CookieConsent $consent): Response
    {
        return inertia('admin/cookie-consents/show', [
            'consent' => $consent,
        ]);
    }
}
