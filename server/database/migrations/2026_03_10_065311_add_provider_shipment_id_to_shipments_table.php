<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table): void {
            // ID przesyłki u dostawcy (Furgonetka lub InPost ShipX)
            $table->string('provider_shipment_id')->nullable()->after('carrier');
            $table->index('provider_shipment_id');
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table): void {
            $table->dropIndex(['provider_shipment_id']);
            $table->dropColumn('provider_shipment_id');
        });
    }
};
