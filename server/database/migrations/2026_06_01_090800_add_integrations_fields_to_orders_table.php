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
        Schema::table('orders', function (Blueprint $table): void {
            $table->string('ga_client_id')->nullable()->after('currency_code')->comment('GA4 client_id from _ga cookie');
            $table->string('baselinker_order_id')->nullable()->after('ga_client_id')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn(['ga_client_id', 'baselinker_order_id']);
        });
    }
};
