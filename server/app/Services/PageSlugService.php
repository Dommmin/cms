<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Page;
use Illuminate\Support\Str;

class PageSlugService
{
    public function uniqueSlug(string $title, ?int $parentId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $counter = 2;

        while ($this->exists($slug, $parentId)) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    private function exists(string $slug, ?int $parentId): bool
    {
        return Page::query()
            ->where('slug', $slug)
            ->where('parent_id', $parentId)
            ->exists();
    }
}
