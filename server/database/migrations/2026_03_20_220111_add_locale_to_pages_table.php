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
            $table->string('locale', 10)->nullable()->after('parent_id')
                ->comment('null = global (fallback for all locales), or locale code e.g. pl, en');

            $table->dropUnique('pages_parent_slug_unique');
            $table->unique(['parent_id', 'slug', 'locale'], 'pages_parent_slug_locale_unique');
            $table->index('locale');
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->dropIndex('pages_locale_index');
            $table->dropUnique('pages_parent_slug_locale_unique');
            $table->unique(['parent_id', 'slug'], 'pages_parent_slug_unique');
            $table->dropColumn('locale');
        });
    }
};
