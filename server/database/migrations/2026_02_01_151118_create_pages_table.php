<?php

declare(strict_types=1);

use App\Enums\PageLayoutEnum;
use App\Enums\PageTypeEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->references('id')->on('pages')->nullOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->longText('content')->nullable();
            $table->text('excerpt')->nullable();
            $table->longText('rich_content')->nullable();
            $table->enum('layout', array_column(PageLayoutEnum::cases(), 'value'))->default(PageLayoutEnum::Default->value);
            $table->json('builder_snapshot')->nullable();
            $table->enum('page_type', ['blocks', 'module'])->default(PageTypeEnum::Blocks->value);
            $table->string('module_name')->nullable();
            $table->json('module_config')->nullable();
            $table->foreignId('theme_id')->nullable()->constrained('themes')->nullOnDelete();
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->unsignedBigInteger('published_version_id')->nullable();
            $table->unsignedBigInteger('draft_version_id')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 255)->nullable();
            $table->string('seo_canonical')->nullable();
            $table->json('available_locales')->nullable();
            $table->timestamps();

            $table->unique(['parent_id', 'slug'], 'pages_parent_slug_unique');
            $table->index('slug');
            $table->index('is_published');
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
