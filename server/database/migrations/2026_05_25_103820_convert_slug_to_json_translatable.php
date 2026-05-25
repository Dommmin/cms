<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->dropUnique('pages_parent_slug_locale_unique');
            $table->dropIndex('pages_slug_index');
            $table->json('slug')->nullable()->change();
            $table->dropColumn('slug_translations');
        });

        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->dropUnique('blog_posts_slug_unique');
            $table->json('slug')->nullable()->change();
            $table->dropColumn('slug_translations');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->dropUnique('products_slug_unique');
            $table->dropIndex('products_slug_index');
            $table->json('slug')->nullable()->change();
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->dropUnique('categories_slug_unique');
            $table->dropIndex('categories_slug_index');
            $table->json('slug')->nullable()->change();
        });

        Schema::table('blogs', function (Blueprint $table): void {
            $table->dropUnique('blogs_slug_unique');
            $table->json('slug')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('blogs', function (Blueprint $table): void {
            $table->string('slug')->nullable()->change();
            $table->unique('slug');
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->string('slug')->nullable()->change();
            $table->unique('slug');
            $table->index('slug');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->string('slug')->nullable()->change();
            $table->unique('slug');
            $table->index('slug');
        });

        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->string('slug')->nullable()->change();
            $table->unique('slug');
        });

        Schema::table('pages', function (Blueprint $table): void {
            $table->string('slug')->nullable()->change();
            $table->unique(['parent_id', 'slug', 'locale'], 'pages_parent_slug_locale_unique');
            $table->index('slug');
        });
    }
};
