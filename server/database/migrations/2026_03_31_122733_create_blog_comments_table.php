<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_comments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('blog_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('blog_comments')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_approved')->default(true);
            $table->timestamps();

            $table->index(['blog_post_id', 'parent_id', 'is_approved']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_comments');
    }
};
