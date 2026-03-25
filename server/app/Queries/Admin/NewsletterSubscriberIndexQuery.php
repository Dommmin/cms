<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterSubscriberIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return NewsletterSubscriber::query()
            ->when($this->request->search, function ($query, string $search): void {
                $query->where('email', 'like', sprintf('%%%s%%', $search));
            })
            ->when($this->request->status, function ($query, $status): void {
                $query->where('status', $status);
            })
            ->when($this->request->segment, function ($query, $segment): void {
                $query->whereHas('segments', function ($q) use ($segment): void {
                    $q->where('newsletter_segments.id', $segment);
                });
            })
            ->orderBy('email')
            ->paginate(25)
            ->withQueryString();
    }
}
