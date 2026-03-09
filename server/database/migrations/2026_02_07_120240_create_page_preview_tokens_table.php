<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_preview_tokens', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('page_id');
            $table->unsignedBigInteger('page_version_id')->nullable();
            $table->string('token_hash')->unique();
            $table->timestamp('expires_at');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index(['page_id', 'expires_at']);

            if (config('database.default') !== 'sqlite') {
                $table->foreign('page_id')->references('id')->on('pages')->cascadeOnDelete();
                $table->foreign('page_version_id')->references('id')->on('page_versions')->nullOnDelete();
                $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_preview_tokens');
    }
};
