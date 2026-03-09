<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('block_relations', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('page_block_id');
            $table->string('relation_type', 100);
            $table->unsignedBigInteger('relation_id');
            $table->string('relation_key', 100)->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('page_block_id')
                ->references('id')
                ->on('page_blocks')
                ->cascadeOnDelete();

            $table->index(['page_block_id', 'relation_type']);
            $table->index(['page_block_id', 'relation_key']);
            $table->index(['relation_type', 'relation_id']);
            $table->index(['page_block_id', 'relation_type', 'relation_key', 'position'], 'idx_full_lookup');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('block_relations');
    }
};
