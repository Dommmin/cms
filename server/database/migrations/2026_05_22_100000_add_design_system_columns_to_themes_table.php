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
            $table->json('typography')->nullable();
            $table->json('spacing')->nullable();
            $table->json('buttons')->nullable();
            $table->json('containers')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('themes', function (Blueprint $table): void {
            $table->dropColumn(['typography', 'spacing', 'buttons', 'containers']);
        });
    }
};
