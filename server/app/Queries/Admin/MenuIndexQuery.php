<?php

declare(strict_types=1);

namespace App\Queries\Admin;

use App\Enums\MenuLocationEnum;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

final readonly class MenuIndexQuery
{
    public function __construct(private Request $request) {}

    public function execute(): LengthAwarePaginator
    {
        return Menu::query()
            ->withCount('allItems')
            ->when($this->request->search, function ($query, string $search): void {
                $query->where('name', 'like', sprintf('%%%s%%', $search));
            })
            ->when($this->request->location, function ($query, $location): void {
                $query->where('location', $location);
            })
            ->when($this->request->has('is_active'), function ($query): void {
                $query->where('is_active', $this->request->boolean('is_active'));
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();
    }

    public function getLocations(): Collection
    {
        return collect(MenuLocationEnum::cases())->map(fn ($l): array => [
            'value' => $l->value,
            'label' => $l->label(),
        ]);
    }
}
