<?php

declare(strict_types=1);

use App\Models\Wishlist;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wishlist_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(Wishlist::class)->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['wishlist_id', 'product_variant_id']);
            $table->index('wishlist_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlist_items');
    }
};
