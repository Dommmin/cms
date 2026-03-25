<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('blog_category_id')->nullable();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->enum('content_type', ['richtext', 'markdown'])->default('richtext');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->string('featured_image')->nullable();
            $table->json('tags')->nullable();
            $table->json('available_locales')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedSmallInteger('reading_time')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();

            $table->foreign('blog_category_id')->references('id')->on('blog_categories')->nullOnDelete();
            $table->index('status');
            $table->index('published_at');
            $table->index('user_id');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
