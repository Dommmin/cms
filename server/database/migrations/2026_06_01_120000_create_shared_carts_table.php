<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_carts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('source_cart_id')->nullable()->constrained('carts')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('public_token', 64)->unique();
            $table->string('currency_code', 3)->default('PLN');
            $table->string('locale', 10)->nullable();
            $table->string('discount_code')->nullable();
            $table->json('snapshot');
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('uses_count')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'expires_at']);
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_carts');
    }
};
