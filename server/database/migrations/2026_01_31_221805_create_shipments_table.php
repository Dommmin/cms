<?php

declare(strict_types=1);

use App\Enums\ShipmentStatusEnum;
use App\Models\Order;
use App\Models\ShippingMethod;
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
        Schema::create('shipments', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(Order::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(ShippingMethod::class)->constrained();
            $table->string('carrier');                         // "inpost" — denormalizacja dla szybkości
            $table->string('tracking_number')->nullable();
            $table->string('label_url')->nullable();           // PDF etykiety
            $table->enum('status', array_column(ShipmentStatusEnum::cases(), 'value'))->default(ShipmentStatusEnum::PENDING->value);
            $table->string('pickup_point_id')->nullable();     // "PNP001" — paczkomat
            $table->json('carrier_payload')->nullable();       // Raw response od API kuriera
            $table->timestamps();

            $table->index('order_id');
            $table->index('tracking_number');
            $table->index(['order_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
