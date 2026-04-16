<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_variants', function (Blueprint $table): void {
            $table->string('stock_status')->default('in_stock')->after('stock_threshold');
            $table->boolean('backorder_allowed')->default(false)->after('stock_status');
            $table->timestamp('available_at')->nullable()->after('backorder_allowed');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table): void {
            $table->dropColumn(['stock_status', 'backorder_allowed', 'available_at']);
        });
    }
};
