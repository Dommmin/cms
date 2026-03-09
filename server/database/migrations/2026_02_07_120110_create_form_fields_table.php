<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_fields', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('form_id');
            $table->string('name');
            $table->string('label');
            $table->string('type');
            $table->json('options')->nullable();
            $table->json('validation')->nullable();
            $table->json('settings')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_required')->default(false);
            $table->timestamps();

            $table->index(['form_id', 'position']);

            if (config('database.default') !== 'sqlite') {
                $table->foreign('form_id')->references('id')->on('forms')->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};
