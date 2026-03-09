<?php

declare(strict_types=1);

use App\Models\Customer;
use App\Models\ProductReview;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_helpful_votes', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(ProductReview::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Customer::class)->constrained()->cascadeOnDelete();
            $table->boolean('is_helpful');
            $table->timestamps();

            $table->unique(['product_review_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_helpful_votes');
    }
};
