<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('model_versions');
        Schema::create('model_versions', function (Blueprint $table) {
            $table->id();
            $table->morphs('versionable');
            $table->unsignedInteger('version_number');
            $table->json('snapshot');
            $table->json('changes')->nullable();
            $table->string('event', 30)->default('updated');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('change_note')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['versionable_type', 'versionable_id', 'version_number'], 'mv_versionable_number_unique');
            $table->index(['versionable_type', 'versionable_id'], 'mv_versionable_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('model_versions');
    }
};
