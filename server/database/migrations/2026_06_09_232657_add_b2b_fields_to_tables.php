<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->string('customer_type')->default('individual')->after('user_id');
            $table->boolean('is_tax_exempt')->default(false)->after('tax_id');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->string('customer_type')->default('individual')->after('customer_id');
            $table->boolean('is_tax_exempt')->default(false)->after('customer_type');
            $table->boolean('wants_invoice')->default(false)->after('is_tax_exempt');
            $table->integer('items_tax_amount')->default(0)->after('tax_amount');
            $table->integer('shipping_tax_amount')->default(0)->after('items_tax_amount');
        });

        Schema::table('shipping_methods', function (Blueprint $table): void {
            $table->foreignId('tax_rate_id')->nullable()->after('id')->constrained('tax_rates')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('shipping_methods', function (Blueprint $table): void {
            $table->dropForeign(['tax_rate_id']);
            $table->dropColumn('tax_rate_id');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['customer_type', 'is_tax_exempt', 'wants_invoice', 'items_tax_amount', 'shipping_tax_amount']);
        });

        Schema::table('customers', function (Blueprint $table): void {
            $table->dropColumn(['customer_type', 'is_tax_exempt']);
        });
    }
};
