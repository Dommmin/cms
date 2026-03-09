<?php

declare(strict_types=1);

use App\Enums\ReturnItemConditionEnum;
use App\Models\OrderItem;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('return_id')->constrained('returns')->cascadeOnDelete();
            $table->foreignIdFor(OrderItem::class)->constrained();
            $table->unsignedSmallInteger('quantity');
            $table->enum('condition', array_column(ReturnItemConditionEnum::cases(), 'value'))->nullable();
            $table->text('notes')->nullable();

            $table->unique(['return_id', 'order_item_id']);
            $table->index('return_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('return_items');
    }
};
