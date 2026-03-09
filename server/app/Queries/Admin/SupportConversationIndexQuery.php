<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\SupportConversation;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

final readonly class SupportConversationIndexQuery
{
    public function __construct(private Request $request) {}

    public function execute(): LengthAwarePaginator
    {
        return SupportConversation::query()
            ->with(['assignedTo:id,name'])
            ->withCount(['messages', 'unreadMessages'])
            ->when($this->request->search, function ($query, string $search): void {
                $query->where('subject', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            })
            ->when($this->request->status, function ($query, string $status): void {
                $query->where('status', $status);
            })
            ->when($this->request->assigned_to, function ($query, string $assignedTo): void {
                $query->where('assigned_to', $assignedTo);
            })
            ->orderByDesc('last_reply_at')
            ->paginate(20)
            ->withQueryString();
    }
}
