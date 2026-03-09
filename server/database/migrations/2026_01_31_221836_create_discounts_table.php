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
        Schema::create('discounts', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->nullable()->unique();      // "SUMMER20" — null = auto rabat
            $table->string('name');
            $table->enum('type', ['percentage', 'fixed_amount', 'free_shipping']);
            // ─── Value: INTEGER dla fixed_amount, integer % dla percentage ─
            $table->unsignedInteger('value');                  // 20 = 20% albo 2000 = 20.00 zł
            $table->enum('apply_to', ['all', 'specific_products', 'specific_categories'])->default('all');
            $table->unsignedInteger('min_order_value')->nullable();  // Min wartość zamówienia (grosze)
            $table->unsignedInteger('max_uses')->nullable();         // Max użyć globalnie
            $table->unsignedInteger('uses_count')->default(0);
            $table->unsignedSmallInteger('max_uses_per_customer')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('code');
            $table->index(['is_active', 'starts_at', 'ends_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
