<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\AppNotification;
use Illuminate\Http\Request;

class AppNotificationIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return AppNotification::query()
            ->with('customer')
            ->when($this->request->search, function ($query, $search): void {
                $query->where('type', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('channel', 'like', sprintf('%%%s%%', $search))
                    ->orWhereHas('customer', function ($q) use ($search): void {
                        $q->where('first_name', 'like', sprintf('%%%s%%', $search))
                            ->orWhere('last_name', 'like', sprintf('%%%s%%', $search))
                            ->orWhere('email', 'like', sprintf('%%%s%%', $search));
                    });
            })
            ->when($this->request->type, function ($query, $type): void {
                $query->where('type', $type);
            })
            ->when($this->request->channel, function ($query, $channel): void {
                $query->where('channel', $channel);
            })
            ->when($this->request->status, function ($query, $status): void {
                $query->where('status', $status);
            })->latest()
            ->paginate(20)
            ->withQueryString();
    }
}
