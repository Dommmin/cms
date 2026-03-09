<?php

declare(strict_types=1);

use App\Models\Attribute;
use App\Models\ProductType;
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
        Schema::create('product_type_attributes', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(ProductType::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Attribute::class)->constrained()->cascadeOnDelete();
            $table->boolean('is_required')->default(false);
            $table->unsignedTinyInteger('position')->default(0);

            $table->unique(['product_type_id', 'attribute_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_type_attributes');
    }
};
