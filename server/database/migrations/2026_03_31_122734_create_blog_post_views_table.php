<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_post_views', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('blog_post_id')->constrained()->cascadeOnDelete();
            $table->string('ip_hash', 64);
            $table->timestamp('viewed_at');

            $table->unique(['blog_post_id', 'ip_hash']);
            $table->index('blog_post_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_post_views');
    }
};
