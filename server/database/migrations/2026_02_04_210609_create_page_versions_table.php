<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_versions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('page_id');
            $table->integer('version_number');
            $table->json('snapshot')->comment('Full page + content + sections snapshot');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->text('change_note')->nullable();
            $table->timestamps();

            $table->unique(['page_id', 'version_number'], 'page_versions_page_version_unique');

            // Add foreign keys (SQLite has limited support)
            if (config('database.default') !== 'sqlite') {
                $table->foreign('page_id')->references('id')->on('pages')->cascadeOnDelete();
                $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_versions');
    }
};
