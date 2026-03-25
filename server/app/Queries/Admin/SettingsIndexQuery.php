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
            ->when($this->request->search, function ($query, $search): void {
                $query->where('key', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('description', 'like', sprintf('%%%s%%', $search));
            })
            ->when($this->request->group, function ($query, $group): void {
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
