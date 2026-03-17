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
            // Stores locale-specific slugs, e.g. {"pl": "kontakt", "de": "kontakte"}
            // The canonical `slug` column remains the default (English) slug.
            $table->json('slug_translations')->nullable()->after('slug');
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->dropColumn('slug_translations');
        });
    }
};
