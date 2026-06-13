<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Blog;
use App\Models\BlogPost;
use App\Services\DefaultBlogResolver;
use Illuminate\Database\Seeder;

class DefaultBlogSeeder extends Seeder
{
    public function run(): void
    {
        $blog = resolve(DefaultBlogResolver::class)->resolve();

        $blog->forceFill([
            'name' => ['en' => 'Blog', 'pl' => 'Blog'],
            'slug' => ['en' => 'blog', 'pl' => 'blog'],
            'description' => [
                'en' => 'Editorial stories, guides, and product knowledge.',
                'pl' => 'Historie redakcyjne, poradniki i wiedza produktowa.',
            ],
            'layout' => 'grid',
            'commentable' => true,
            'is_active' => true,
            'available_locales' => ['en', 'pl'],
            'position' => 0,
        ])->save();

        BlogPost::query()
            ->whereNull('blog_id')
            ->update(['blog_id' => $blog->id]);

        Blog::query()
            ->whereKeyNot($blog->id)
            ->where('slug->en', 'blog')
            ->delete();
    }
}
