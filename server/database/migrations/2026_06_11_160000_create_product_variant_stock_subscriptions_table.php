<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variant_stock_subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_variant_id')
                ->constrained('product_variants')
                ->cascadeOnDelete();
            $table->string('email');
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();

            $table->index('email');
            $table->index(['product_variant_id', 'notified_at'], 'pv_stock_subs_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variant_stock_subscriptions');
    }
};
