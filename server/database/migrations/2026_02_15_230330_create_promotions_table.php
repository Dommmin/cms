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
        Schema::create('promotions', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping']);
            $table->decimal('value', 10, 2)->nullable();
            $table->decimal('min_value', 10, 2)->nullable();
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->enum('apply_to', ['all', 'specific_products', 'specific_categories']);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_stackable')->default(false);
            $table->unsignedSmallInteger('priority')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'priority', 'starts_at', 'ends_at']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
