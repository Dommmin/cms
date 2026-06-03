<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('policy_document_versions', function (Blueprint $table): void {
            $table->id();
            $table->string('system_page_key', 100);
            $table->foreignId('page_id')->constrained('pages')->cascadeOnDelete();
            $table->string('locale', 10)->nullable();
            $table->unsignedInteger('revision');
            $table->string('version_label', 32);
            $table->string('content_checksum', 64);
            $table->timestamp('effective_from')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_current')->default(true);
            $table->timestamps();

            $table->index(['system_page_key', 'locale', 'is_current']);
            $table->unique(['system_page_key', 'locale', 'revision'], 'policy_doc_versions_unique_revision');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('policy_document_versions');
    }
};
