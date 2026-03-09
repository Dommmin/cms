<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\CookieConsent;
use Illuminate\Http\Request;

class CookieConsentIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return CookieConsent::query()
            ->when($this->request->search, function ($query, $search) {
                $query->where('ip_address', 'like', "%{$search}%")
                    ->orWhere('user_agent', 'like', "%{$search}%");
            })
            ->when($this->request->has('granted'), function ($query) {
                $query->where('granted', $this->request->boolean('granted'));
            })
            ->when($this->request->date_from, function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($this->request->date_to, function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(50)
            ->withQueryString();
    }

    public function getStats()
    {
        return [
            'total_count' => CookieConsent::count(),
            'granted_count' => CookieConsent::where('granted', true)->count(),
            'denied_count' => CookieConsent::where('granted', false)->count(),
        ];
    }
}
