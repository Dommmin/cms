<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cookie_consents', function (Blueprint $table): void {
            $table->id();
            $table->string('session_id', 64)->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('category', 32); // necessary, analytics, marketing
            $table->boolean('granted');
            $table->string('ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index(['session_id', 'category']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cookie_consents');
    }
};
