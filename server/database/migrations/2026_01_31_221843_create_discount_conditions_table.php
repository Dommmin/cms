<?php

use App\Models\Discount;
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
        Schema::create('discount_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Discount::class)->constrained()->cascadeOnDelete();
            $table->enum('type', ['product', 'category', 'variant']);
            $table->unsignedBigInteger('entity_id');           // ID produktu / kategorii / wariantu

            $table->unique(['discount_id', 'type', 'entity_id']);
            $table->index('discount_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discount_conditions');
    }
};
