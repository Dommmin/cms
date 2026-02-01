<?php

use App\Enums\OrderStatusEnum;
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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();      // "ORD-2025-00142"
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete(); // Guest = null
            $table->foreignId('billing_address_id')->constrained();
            $table->foreignId('shipping_address_id')->constrained();
            $table->enum('status', OrderStatusEnum::cases())->default(OrderStatusEnum::PENDING->value);
            // ─── Wszystkie kwoty jako INTEGER (grosze) ───────
            $table->unsignedInteger('subtotal');               // Suma linii (bez VAT, bez shipping)
            $table->unsignedInteger('discount_amount')->default(0);
            $table->unsignedInteger('shipping_cost');
            $table->unsignedInteger('tax_amount');             // VAT
            $table->unsignedInteger('total');                  // SUMA
            // ─── Currency tracking ────────────────────────
            $table->string('currency_code', 3)->default('PLN');           // Waluta zamówienia
            $table->decimal('exchange_rate', 10, 6)->default(1.000000);   // Rate użyty przy zamówieniu
            $table->text('notes')->nullable();                 // Uwagi klienta
            $table->timestamps();

            $table->index('reference_number');
            $table->index('customer_id');
            $table->index('status');
            $table->index(['customer_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
