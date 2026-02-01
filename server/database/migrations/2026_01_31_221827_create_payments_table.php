<?php

use App\Enums\PaymentStatusEnum;
use App\Models\Order;
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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Order::class)->constrained()->cascadeOnDelete();
            $table->enum('provider', ['p24', 'payu', 'stripe']); // Extensible
            $table->string('provider_transaction_id')->nullable();
            $table->enum('status', PaymentStatusEnum::cases())->default(PaymentStatusEnum::PENDING->value);
            // ─── Kwota jako INTEGER (grosze) ─────────────────
            $table->unsignedInteger('amount');
            $table->string('currency_code', 3)->default('PLN');
            $table->json('payload')->nullable();               // Raw response od bramki
            $table->timestamps();

            $table->index('order_id');
            $table->index('provider_transaction_id');
            $table->index(['order_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
