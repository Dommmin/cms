<?php

declare(strict_types=1);

use App\Models\BlogPost;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('taggables', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->morphs('taggable');
            $table->timestamps();
            $table->unique(['tag_id', 'taggable_type', 'taggable_id']);
        });

        // Migrate existing blog_post_tag data
        if (Schema::hasTable('blog_post_tag')) {
            DB::table('blog_post_tag')->get()->each(function (object $row): void {
                DB::table('taggables')->insertOrIgnore([
                    'tag_id' => $row->tag_id,
                    'taggable_type' => BlogPost::class,
                    'taggable_id' => $row->blog_post_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

            Schema::dropIfExists('blog_post_tag');
        }
    }

    public function down(): void
    {
        Schema::create('blog_post_tag', function (Blueprint $table): void {
            $table->foreignId('blog_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['blog_post_id', 'tag_id']);
        });

        // Migrate taggables data back
        DB::table('taggables')
            ->where('taggable_type', BlogPost::class)
            ->get()
            ->each(function (object $row): void {
                DB::table('blog_post_tag')->insertOrIgnore([
                    'blog_post_id' => $row->taggable_id,
                    'tag_id' => $row->tag_id,
                ]);
            });

        Schema::dropIfExists('taggables');
    }
};
