<?php

use App\Modules\Ecommerce\Domain\Models\Brand;
use App\Modules\Ecommerce\Domain\Models\Category;
use App\Modules\Ecommerce\Domain\Models\ProductType;
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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProductType::class)->constrained();
            $table->foreignIdFor(Category::class)->constrained();
            $table->foreignIdFor(Brand::class)->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();           // Rich text / HTML
            $table->text('short_description')->nullable();
            $table->string('sku_prefix')->nullable();          // "BN-" prefix dla SKU
            $table->boolean('is_active')->default(true);
            $table->boolean('is_saleable')->default(true);     // Można kupić? (może być "info only")
            $table->timestamp('available_from')->nullable();
            $table->timestamp('available_until')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 255)->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('category_id');
            $table->index('brand_id');
            $table->index(['is_active', 'is_saleable']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
