<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PageBlock;
use Illuminate\Support\Collection;

class BlockUsageService
{
    /**
     * @return array<string, array{count: int, pages: array<int, array{id: int, title: string, slug: string}>}>
     */
    public function getUsages(): array
    {
        $blocks = PageBlock::query()
            ->with('page:id,title,slug')
            ->get(['id', 'type', 'page_id']);

        $byType = $blocks->groupBy(fn (PageBlock $b): string => $b->type->value);
        $result = [];

        foreach ($byType as $type => $items) {
            /** @var Collection<int, PageBlock> $items */
            $pages = $items->map(fn (PageBlock $b) => $b->page)
                ->filter()
                ->unique('id')
                ->map(fn ($page): array => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'slug' => $page->slug,
                ])
                ->values()
                ->all();

            $result[$type] = [
                'count' => $items->count(),
                'pages' => $pages,
            ];
        }

        return $result;
    }
}
