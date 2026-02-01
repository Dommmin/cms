<?php

use App\Models\Product;
use App\Models\ProductVariant;
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
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Product::class)->constrained()->cascadeOnDelete();
            // Nullable — linked do konkretnego wariantu (zmienia się przy wyborze wariantu)
            $table->foreignIdFor(ProductVariant::class)->nullable()->constrained()->nullOnDelete();
            $table->string('path');
            $table->string('alt_text')->nullable();
            $table->boolean('is_thumbnail')->default(false);   // Główne zdjęcie
            $table->unsignedTinyInteger('position')->default(0);
            $table->timestamps();

            $table->index('product_id');
            $table->index(['product_id', 'is_thumbnail']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
