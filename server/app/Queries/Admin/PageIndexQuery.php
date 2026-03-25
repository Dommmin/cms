<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\Page;
use Illuminate\Http\Request;

class PageIndexQuery
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function execute()
    {
        return Page::query()
            ->with(['parent:id,title,slug'])
            ->when($this->request->search, function ($query, $search): void {
                $query->where('title', 'like', sprintf('%%%s%%', $search))
                    ->orWhere('slug', 'like', sprintf('%%%s%%', $search));
            })
            ->when($this->request->status, function ($query, $status): void {
                $query->where('status', $status);
            })
            ->when($this->request->has('is_home'), function ($query): void {
                $query->where('is_home', $this->request->boolean('is_home'));
            })
            ->when($this->request->filled('locale'), function ($query): void {
                $locale = $this->request->string('locale')->toString();
                $query->forLocale($locale);
            })
            ->orderByRaw('COALESCE(parent_id, id), parent_id IS NOT NULL, title')
            ->paginate(20)
            ->withQueryString();
    }
}
