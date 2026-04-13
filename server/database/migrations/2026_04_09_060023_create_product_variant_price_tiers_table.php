<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variant_price_tiers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('min_quantity');
            $table->unsignedSmallInteger('max_quantity')->nullable();
            $table->unsignedInteger('price');
            $table->timestamps();
            $table->index('product_variant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variant_price_tiers');
    }
};
