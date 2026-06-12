<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Blog;

class DefaultBlogResolver
{
    public function resolve(): Blog
    {
        return Blog::query()
            ->active()
            ->orderBy('position')
            ->orderBy('id')
            ->first()
            ?? Blog::query()
                ->orderBy('position')
                ->orderBy('id')
                ->first()
            ?? Blog::query()->create($this->defaultPayload());
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultPayload(): array
    {
        return [
            'name' => ['en' => 'Blog'],
            'slug' => ['en' => 'blog'],
            'description' => null,
            'layout' => 'grid',
            'commentable' => true,
            'default_author_id' => null,
            'seo_title' => null,
            'seo_description' => null,
            'is_active' => true,
            'available_locales' => null,
            'position' => 0,
        ];
    }
}
