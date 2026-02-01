<?php

declare(strict_types=1);

use App\Modules\Ecommerce\Domain\Models\AttributeValue;
use App\Modules\Ecommerce\Domain\Models\Attribute;
use App\Modules\Ecommerce\Domain\Models\ProductVariant;
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
        // ─── Atrybuty wariantu ─────────────────────────────
        // "Bluza Nike — Czarna / L" → color=Czarny, size=L
        Schema::create('variant_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProductVariant::class, 'variant_id')->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Attribute::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(AttributeValue::class)->constrained()->cascadeOnDelete();

            // Jeden wariant ma jeden value per attribute
            $table->unique(['variant_id', 'attribute_id']);
            $table->index('variant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variant_attribute_values');
    }
};
