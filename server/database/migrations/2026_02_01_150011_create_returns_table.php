<?php

use App\Enums\ReturnStatus;
use App\Enums\ReturnType;
use App\Modules\Ecommerce\Domain\Models\Order;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Order::class)->constrained();
            $table->string('reference_number')->unique();
            $table->enum('return_type', array_column(ReturnType::cases(), 'value'));
            $table->enum('status', array_column(ReturnStatus::cases(), 'value'))->default(ReturnStatus::Pending->value);
            $table->text('reason')->nullable();
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('return_tracking_number')->nullable();
            $table->string('return_label_url')->nullable();
            $table->unsignedInteger('refund_amount')->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('reference_number');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};
