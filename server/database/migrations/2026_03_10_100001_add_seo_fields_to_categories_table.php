<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->string('canonical_url')->nullable()->after('seo_description');
            $table->string('meta_robots', 100)->default('index, follow')->after('canonical_url');
            $table->string('og_image')->nullable()->after('meta_robots');
            $table->boolean('sitemap_exclude')->default(false)->after('og_image');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->dropColumn(['canonical_url', 'meta_robots', 'og_image', 'sitemap_exclude']);
        });
    }
};
