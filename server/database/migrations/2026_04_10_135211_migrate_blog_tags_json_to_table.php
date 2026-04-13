<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $posts = DB::table('blog_posts')
            ->whereNotNull('tags')
            ->where('tags', '!=', '[]')
            ->get(['id', 'tags']);

        foreach ($posts as $post) {
            $tagNames = json_decode((string) $post->tags, true);
            if (! is_array($tagNames)) {
                continue;
            }

            if ($tagNames === []) {
                continue;
            }

            foreach ($tagNames as $name) {
                $name = mb_trim((string) $name);
                if ($name === '') {
                    continue;
                }

                $slug = Str::slug($name);

                $tagId = DB::table('tags')->where('slug', $slug)->value('id');

                if (! $tagId) {
                    $tagId = DB::table('tags')->insertGetId([
                        'name' => $name,
                        'slug' => $slug,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::table('blog_post_tag')->insertOrIgnore([
                    'blog_post_id' => $post->id,
                    'tag_id' => $tagId,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Non-reversible data migration — tags JSON column is kept intact
    }
};
