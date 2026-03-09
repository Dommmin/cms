<?php

declare(strict_types=1);

use App\Enums\ReviewStatusEnum;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_reviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(Product::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Customer::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Order::class)->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->string('title')->nullable();
            $table->text('body')->nullable();
            $table->enum('status', array_column(ReviewStatusEnum::cases(), 'value'))->default(ReviewStatusEnum::Pending->value);
            $table->boolean('is_verified_purchase')->default(false);
            $table->unsignedSmallInteger('helpful_count')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'customer_id']);
            $table->index('product_id');
            $table->index('customer_id');
            $table->index(['product_id', 'status']);
            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
    }
};
