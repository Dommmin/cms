<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $blogId = DB::table('blogs')
            ->orderByDesc('is_active')
            ->orderBy('position')
            ->orderBy('id')
            ->value('id');

        if (! is_int($blogId)) {
            $now = now();

            $blogId = DB::table('blogs')->insertGetId([
                'name' => json_encode(['en' => 'Blog'], JSON_THROW_ON_ERROR),
                'slug' => json_encode(['en' => 'blog'], JSON_THROW_ON_ERROR),
                'description' => null,
                'layout' => 'grid',
                'commentable' => true,
                'default_author_id' => null,
                'seo_title' => null,
                'seo_description' => null,
                'is_active' => true,
                'available_locales' => null,
                'position' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        DB::table('blog_posts')
            ->whereNull('blog_id')
            ->update(['blog_id' => $blogId]);
    }

    public function down(): void
    {
    }
};
