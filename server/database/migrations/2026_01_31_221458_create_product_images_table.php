<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(Product::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(ProductVariant::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Media::class)->constrained()->cascadeOnDelete();
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
