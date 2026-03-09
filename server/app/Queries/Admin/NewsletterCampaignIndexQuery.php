<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\NewsletterCampaign;
use App\Models\NewsletterSegment;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

final readonly class NewsletterCampaignIndexQuery
{
    public function __construct(private Request $request) {}

    public function execute(): LengthAwarePaginator
    {
        return NewsletterCampaign::query()
            ->with('segment:id,name')
            ->when($this->request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            })
            ->when($this->request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($this->request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();
    }

    public function getActiveSegments(): Collection
    {
        return NewsletterSegment::where('is_active', true)->get(['id', 'name']);
    }
}
