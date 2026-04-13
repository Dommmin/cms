<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('query');
            $table->unsignedInteger('results_count')->default(0);
            $table->boolean('is_autocomplete')->default(false);
            $table->string('locale', 10)->nullable();
            $table->nullableMorphs('searcher');
            $table->string('ip')->nullable();
            $table->timestamps();
            $table->index(['query', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_logs');
    }
};
