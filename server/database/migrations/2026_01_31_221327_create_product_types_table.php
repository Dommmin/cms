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
        Schema::create('product_types', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('has_variants')->default(true);
            // JSON array attribute slugs, które tworzą warianty
            // ["color", "size"] — system auto-generuje warianty z kombinacji
            $table->json('variant_selection_attributes')->nullable();
            $table->boolean('is_shippable')->default(true);   // Digital goods = false
            $table->timestamps();

            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_types');
    }
};
