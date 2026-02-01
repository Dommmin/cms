<?php

use App\Enums\PageLayout;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('static_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->references('id')->on('static_pages')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->text('excerpt')->nullable();
            $table->enum('layout', array_column(PageLayout::cases(), 'value'))->default(PageLayout::Default->value);
            $table->boolean('is_published')->default(false);
            $table->boolean('show_in_footer')->default(false);
            $table->boolean('show_in_header')->default(false);
            $table->unsignedTinyInteger('position')->default(0);
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 255)->nullable();
            $table->string('seo_canonical')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('is_published');
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('static_pages');
    }
};
