<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faqs', function (Blueprint $table): void {
            $table->id();
            $table->string('question');
            $table->longText('answer');
            $table->string('category')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('helpful_count')->default(0);
            $table->timestamps();

            $table->index('is_active');
            $table->index('category');
            $table->index('position');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
