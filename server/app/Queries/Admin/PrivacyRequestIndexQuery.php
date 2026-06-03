<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\PrivacyRequest;
use Illuminate\Http\Request;

class PrivacyRequestIndexQuery
{
    public function __construct(
        private readonly Request $request,
    ) {}

    public function execute()
    {
        return PrivacyRequest::query()
            ->with(['user:id,name,email'])
            ->when($this->request->search, function ($query, $search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('email', 'like', sprintf('%%%s%%', $search))
                        ->orWhere('type', 'like', sprintf('%%%s%%', $search))
                        ->orWhereHas('user', function ($userQuery) use ($search): void {
                            $userQuery
                                ->where('name', 'like', sprintf('%%%s%%', $search))
                                ->orWhere('email', 'like', sprintf('%%%s%%', $search));
                        });
                });
            })
            ->when($this->request->filled('type'), function ($query): void {
                $query->where('type', $this->request->string('type')->toString());
            })
            ->when($this->request->filled('status'), function ($query): void {
                $query->where('status', $this->request->string('status')->toString());
            })
            ->latest('requested_at')
            ->paginate(50)
            ->withQueryString();
    }

    public function getStats(): array
    {
        return [
            'total_requests' => PrivacyRequest::query()->count(),
            'completed_requests' => PrivacyRequest::query()->where('status', 'completed')->count(),
            'pending_requests' => PrivacyRequest::query()->where('status', 'pending')->count(),
        ];
    }
}
