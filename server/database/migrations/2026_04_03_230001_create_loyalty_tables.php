<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_points', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('balance')->default(0);
            $table->unsignedInteger('total_earned')->default(0);
            $table->unsignedInteger('total_spent')->default(0);
            $table->timestamps();

            $table->unique('customer_id');
        });

        Schema::create('loyalty_transactions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['earn', 'spend', 'expire', 'adjustment']);
            $table->unsignedInteger('points');
            $table->string('description');
            $table->morphs('source'); // Order, Review, Manual
            $table->unsignedInteger('balance_after');
            $table->timestamps();

            $table->index(['customer_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
        Schema::dropIfExists('loyalty_points');
    }
};
