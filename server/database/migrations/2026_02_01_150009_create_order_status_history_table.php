<?php

use App\Modules\Ecommerce\Domain\Models\Order;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Order::class)->constrained()->cascadeOnDelete();
            $table->string('previous_status');
            $table->string('new_status');
            $table->enum('changed_by', ['system', 'admin', 'customer'])->default('system');
            $table->unsignedBigInteger('changed_by_user_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('changed_at');

            $table->index('order_id');
            $table->index(['order_id', 'changed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
    }
};
