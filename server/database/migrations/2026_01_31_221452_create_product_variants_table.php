<?php

use App\Models\Product;
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
        // ─── Product Variants ───────────────────────────────
        // Jeśli product_type.has_variants = false,
        // system tworzy 1 default variant automatycznie.
        // Cena, stock, SKU zawsze żyją tutaj.
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Product::class)->constrained()->cascadeOnDelete();
            $table->string('sku')->unique();
            $table->string('name');                            // "Czarna / L" lub "Default"
            // ─── Ceny jako INTEGER (grosze / cents) ─────────
            // 1999 = 19.99 zł
            // Zawsze w base currency — konwersja na prezentację
            $table->unsignedInteger('price');                  // Cena sprzedaży
            $table->unsignedInteger('cost_price')->default(0); // Koszt zakupu (marża)
            $table->unsignedInteger('compare_at_price')->nullable(); // Cena przed rabat. (przekreślona)
            $table->decimal('weight', 6, 2)->default(0);       // kg — do obliczeń shipping
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->unsignedSmallInteger('stock_threshold')->default(5); // "Mało w stockie"
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);     // Default variant (dla produktów bez wariantów)
            $table->unsignedTinyInteger('position')->default(0);
            $table->timestamps();

            $table->index('product_id');
            $table->index('sku');
            $table->index(['product_id', 'is_active']);
            $table->index(['product_id', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
