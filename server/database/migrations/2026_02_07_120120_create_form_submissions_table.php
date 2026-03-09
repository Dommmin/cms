<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_submissions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('form_id');
            $table->json('payload');
            $table->string('status')->default('new');
            $table->string('ip')->nullable();
            $table->text('user_agent')->nullable();
            $table->text('referrer')->nullable();
            $table->text('page_url')->nullable();
            $table->timestamps();

            $table->index(['form_id', 'status']);

            if (config('database.default') !== 'sqlite') {
                $table->foreign('form_id')->references('id')->on('forms')->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_submissions');
    }
};
