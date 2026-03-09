<?php

declare(strict_types=1);

use App\Models\ProductVariant;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_history', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(ProductVariant::class)->constrained()->cascadeOnDelete();
            $table->unsignedInteger('price'); // cents
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['product_variant_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_history');
    }
};
