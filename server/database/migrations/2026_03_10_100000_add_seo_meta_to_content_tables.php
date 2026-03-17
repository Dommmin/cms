<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['products', 'blog_posts', 'pages'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                $after = $tableName === 'pages' ? 'seo_canonical' : 'seo_description';
                $table->string('meta_robots', 100)->default('index, follow')->after($after);
                $table->string('og_image')->nullable()->after('meta_robots');
                $table->boolean('sitemap_exclude')->default(false)->after('og_image');
            });
        }
    }

    public function down(): void
    {
        foreach (['products', 'blog_posts', 'pages'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropColumn(['meta_robots', 'og_image', 'sitemap_exclude']);
            });
        }
    }
};
