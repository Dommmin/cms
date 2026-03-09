<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shipping_methods', function (Blueprint $table): void {
            $table->id();
            $table->enum('carrier', ['inpost', 'dpd', 'dhl']);
            $table->string('name');                            // "InPost Paczkomat"
            $table->boolean('is_active')->default(true);
            $table->decimal('min_weight', 6, 2)->nullable();   // kg
            $table->decimal('max_weight', 6, 2)->default(30);  // kg
            // ─── Ceny jako INTEGER (grosze) ──────────────────
            $table->unsignedInteger('min_order_value')->nullable();        // Min wartość zamówienia
            $table->unsignedInteger('free_shipping_threshold')->nullable(); // Od ile zł darmowa dostawa
            $table->unsignedInteger('base_price');                         // Cena podstawowa
            $table->unsignedInteger('price_per_kg')->default(0);           // Dopłata za wagę
            $table->timestamps();

            $table->index('carrier');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_methods');
    }
};
