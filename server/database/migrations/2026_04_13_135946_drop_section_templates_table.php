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
        Schema::dropIfExists('section_templates');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('section_templates', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 255);
            $table->string('section_type', 100);
            $table->string('variant', 100)->nullable();
            $table->json('preset_data');
            $table->string('thumbnail', 500)->nullable();
            $table->boolean('is_global')->default(false);
            $table->string('category', 100)->nullable();
            $table->timestamps();

            $table->index('section_type');
            $table->index('is_global');
        });
    }
};
