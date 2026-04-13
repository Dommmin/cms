<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('data_source'); // orders, products, customers, etc.
            $table->json('metrics'); // revenue, quantity, count, etc.
            $table->json('dimensions')->nullable(); // date, category, status, etc.
            $table->json('filters')->nullable(); // date range, status, etc.
            $table->json('group_by')->nullable(); // day, week, month, category
            $table->string('chart_type')->default('table'); // table, line, bar, pie
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index('data_source');
            $table->index('is_public');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_reports');
    }
};
