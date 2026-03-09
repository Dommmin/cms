<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return Setting::query()
            ->when($this->request->search, function ($query, $search) {
                $query->where('key', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($this->request->group, function ($query, $group) {
                $query->where('group', $group);
            })
            ->orderBy('group')
            ->orderBy('key')
            ->paginate(50)
            ->withQueryString();
    }

    public function getGroups()
    {
        return Setting::query()
            ->distinct()
            ->pluck('group')
            ->filter()
            ->values()
            ->toArray();
    }
}
