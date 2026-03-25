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
            ->when($this->request->search, function ($query, $search): void {
                $query->where('ip_address', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('user_agent', 'like', sprintf('%%%s%%', $search));
            })
            ->when($this->request->has('granted'), function ($query): void {
                $query->where('granted', $this->request->boolean('granted'));
            })
            ->when($this->request->date_from, function ($query, $date): void {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($this->request->date_to, function ($query, $date): void {
                $query->whereDate('created_at', '<=', $date);
            })->latest()
            ->paginate(50)
            ->withQueryString();
    }

    public function getStats(): array
    {
        return [
            'total_count' => CookieConsent::query()->count(),
            'granted_count' => CookieConsent::query()->where('granted', true)->count(),
            'denied_count' => CookieConsent::query()->where('granted', false)->count(),
        ];
    }
}
