<?php

use App\Modules\Core\Domain\Models\Customer;
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
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            // Nullable — guest checkout nie ma customer
            $table->foreignIdFor(Customer::class)->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['billing', 'shipping', 'both'])->default('both');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('company_name')->nullable();
            $table->string('street');
            $table->string('street2')->nullable();             // "Apt 4B"
            $table->string('city');
            $table->string('postal_code');
            $table->string('country_code', 2)->default('PL');
            $table->string('phone');
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index('customer_id');
            $table->index(['customer_id', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
