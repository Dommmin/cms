<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Models\SectionTemplate;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

final readonly class SectionTemplateIndexQuery
{
    public function __construct(private Request $request) {}

    public function execute(): LengthAwarePaginator
    {
        return SectionTemplate::query()
            ->when($this->request->search, function ($query): void {
                $query->where('name', 'like', '%'.$this->request->search.'%')
                    ->orWhere('category', 'like', '%'.$this->request->search.'%');
            })
            ->when($this->request->category, function ($query): void {
                $query->where('category', $this->request->category);
            })
            ->orderBy('category')
            ->orderBy('name')
            ->paginate($this->request->per_page ?? 15)
            ->withQueryString();
    }
}
