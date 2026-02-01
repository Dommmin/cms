<?php

use App\Modules\Reviews\Domain\Models\ProductReview;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_images', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProductReview::class)->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('alt_text')->nullable();
            $table->unsignedTinyInteger('position')->default(0);
            $table->timestamps();

            $table->index('product_review_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_images');
    }
};
