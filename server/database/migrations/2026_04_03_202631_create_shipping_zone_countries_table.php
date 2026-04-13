<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_zone_countries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shipping_zone_id')->constrained()->cascadeOnDelete();
            $table->string('country_code', 2);
            $table->timestamps();

            $table->unique(['shipping_zone_id', 'country_code']);
            $table->index(['country_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_zone_countries');
    }
};