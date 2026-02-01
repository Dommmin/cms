<?php

use App\Modules\Core\Domain\Models\Customer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wishlists', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Customer::class)->constrained()->cascadeOnDelete();
            $table->string('name')->default('My Favorites');
            $table->string('token')->unique()->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index('customer_id');
            $table->index('token');
            $table->index(['customer_id', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlists');
    }
};
