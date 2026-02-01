<?php

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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Category::class, 'parent_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(ProductType::class)->nullable()->constrained(); // Auto product_type dla nowych produktów
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedTinyInteger('position')->default(0);
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 255)->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('parent_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
