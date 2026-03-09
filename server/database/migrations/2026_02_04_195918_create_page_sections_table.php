<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_sections', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('page_id');
            $table->string('section_type')->nullable();
            $table->string('layout')->default('default');
            $table->string('variant')->nullable();
            $table->json('settings')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['page_id', 'position']);

            if (config('database.default') !== 'sqlite') {
                $table->foreign('page_id')->references('id')->on('pages')->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_sections');
    }
};
