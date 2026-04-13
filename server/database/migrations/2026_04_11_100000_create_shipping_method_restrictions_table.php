<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_method_restrictions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('shipping_method_id')->constrained('shipping_methods')->cascadeOnDelete();
            $table->string('restrictable_type'); // 'product' or 'category'
            $table->unsignedBigInteger('restrictable_id');
            $table->timestamps();

            $table->unique(['shipping_method_id', 'restrictable_type', 'restrictable_id'], 'smr_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_method_restrictions');
    }
};
