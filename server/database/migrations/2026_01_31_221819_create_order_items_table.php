<?php

use App\Modules\Ecommerce\Domain\Models\Order;
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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Order::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(ProductVariant::class, 'variant_id')->constrained();    // Reference — ale dane są snapshot
            // Snapshot — kopia w momencie zakupu
            $table->string('product_name');
            $table->string('variant_name');
            $table->string('sku');
            $table->unsignedSmallInteger('quantity');
            // ─── Ceny jako INTEGER (grosze) ──────────────────
            $table->unsignedInteger('unit_price');             // Cena jednostkowa (snapshot)
            $table->unsignedInteger('total_price');            // unit_price × quantity
            $table->timestamps();

            $table->index('order_id');
            $table->index('variant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
