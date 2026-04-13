<?php

declare(strict_types=1);

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
        Schema::create('search_synonyms', function (Blueprint $table): void {
            $table->id();
            $table->string('term');
            $table->json('synonyms');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('term');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_synonyms');
    }
};
