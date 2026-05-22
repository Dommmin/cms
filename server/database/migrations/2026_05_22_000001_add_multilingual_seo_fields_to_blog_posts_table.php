<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->json('slug_translations')->nullable()->after('slug');
            $table->uuid('translation_group_id')->nullable()->after('available_locales');
            $table->string('canonical_url')->nullable()->after('seo_description');
            $table->index('translation_group_id');
        });
    }

    public function down(): void
    {
        Schema::table('blog_posts', function (Blueprint $table): void {
            $table->dropIndex(['translation_group_id']);
            $table->dropColumn(['slug_translations', 'translation_group_id', 'canonical_url']);
        });
    }
};
