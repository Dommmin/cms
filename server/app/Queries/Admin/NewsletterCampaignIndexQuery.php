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
            ->when($this->request->search, function ($query, $search): void {
                $query->where('name', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('subject', 'like', sprintf('%%%s%%', $search));
            })
            ->when($this->request->status, function ($query, $status): void {
                $query->where('status', $status);
            })
            ->when($this->request->type, function ($query, $type): void {
                $query->where('type', $type);
            })->latest()
            ->paginate(20)
            ->withQueryString();
    }

    public function getActiveSegments(): Collection
    {
        return NewsletterSegment::query()->where('is_active', true)->get(['id', 'name']);
    }
}
