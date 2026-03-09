<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('section_templates', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('section_type');
            $table->string('variant')->nullable();
            $table->json('preset_data')->comment('Default data for this template');
            $table->string('thumbnail')->nullable();
            $table->boolean('is_global')->default(false)->comment('Available in all pages');
            $table->string('category')->nullable();
            $table->timestamps();

            $table->index('section_type');
            $table->index('is_global');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('section_templates');
    }
};
