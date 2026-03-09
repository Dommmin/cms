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
            ->when($this->request->search, function ($query, $search) {
                $query->where('type', 'like', "%{$search}%")
                    ->orWhere('channel', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($this->request->type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($this->request->channel, function ($query, $channel) {
                $query->where('channel', $channel);
            })
            ->when($this->request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();
    }
}
