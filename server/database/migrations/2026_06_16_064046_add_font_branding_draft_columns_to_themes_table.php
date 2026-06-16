<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('themes', function (Blueprint $table): void {
            $table->json('font_sources')->nullable()->after('typography');
            $table->json('branding')->nullable()->after('containers');
            $table->json('draft_tokens')->nullable()->after('dark_tokens');
        });
    }

    public function down(): void
    {
        Schema::table('themes', function (Blueprint $table): void {
            $table->dropColumn(['font_sources', 'branding', 'draft_tokens']);
        });
    }
};
