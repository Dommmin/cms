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
        Schema::table('discounts', function (Blueprint $table): void {
            // Stackable with other discounts
            $table->boolean('is_stackable')->default(false);

            // Apply to discounted products or only non-discounted
            $table->boolean('apply_to_discounted_products')->default(true);

            // Auto-apply discount (no code needed)
            $table->boolean('is_auto_apply')->default(false);

            // Priority for auto-apply discounts (lower number = higher priority)
            $table->unsignedSmallInteger('priority')->default(0);

            // Indexes for performance
            $table->index(['is_active', 'is_auto_apply', 'priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('discounts', function (Blueprint $table): void {
            $table->dropIndex(['is_active', 'is_auto_apply', 'priority']);
            $table->dropColumn(['is_stackable', 'apply_to_discounted_products', 'is_auto_apply', 'priority']);
        });
    }
};
