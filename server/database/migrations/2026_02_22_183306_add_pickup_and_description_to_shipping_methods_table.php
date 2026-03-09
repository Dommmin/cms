<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipping_methods', function (Blueprint $table): void {
            // Change carrier from enum to string so we can add new carrier types
            $table->string('carrier')->change();
            $table->string('description')->nullable()->after('name');
            $table->unsignedTinyInteger('estimated_days_min')->nullable()->after('price_per_kg');
            $table->unsignedTinyInteger('estimated_days_max')->nullable()->after('estimated_days_min');
        });
    }

    public function down(): void
    {
        Schema::table('shipping_methods', function (Blueprint $table): void {
            $table->dropColumn(['description', 'estimated_days_min', 'estimated_days_max']);
        });
    }
};
