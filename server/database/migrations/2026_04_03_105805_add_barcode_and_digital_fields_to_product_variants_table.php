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
            $table->string('barcode')->nullable()->after('sku');
            $table->string('ean', 13)->nullable()->after('barcode');
            $table->string('upc', 12)->nullable()->after('ean');
            $table->boolean('is_digital')->default(false)->after('is_active');
            $table->unsignedInteger('download_limit')->nullable()->after('stock_threshold');
            $table->unsignedInteger('download_expiry_days')->nullable()->after('download_limit');

            $table->index('barcode');
            $table->index('ean');
            $table->index('upc');
        });
    }

    public function down(): void
    {
        Schema::table('product_variants', function (Blueprint $table): void {
            $table->dropColumn(['barcode', 'ean', 'upc', 'is_digital', 'download_limit', 'download_expiry_days']);
        });
    }
};
