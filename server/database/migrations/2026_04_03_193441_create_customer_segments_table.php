<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_segments', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['manual', 'dynamic'])->default('dynamic');
            $table->json('rules')->nullable(); // Segment rules as JSON
            $table->integer('customers_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['type', 'is_active']);
        });

        // Pivot table for manual segments
        Schema::create('customer_segment_customer', function (Blueprint $table): void {
            $table->foreignId('customer_segment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->timestamp('added_at')->nullable();
            $table->primary(['customer_segment_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_segment_customer');
        Schema::dropIfExists('customer_segments');
    }
};
