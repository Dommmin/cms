<?php

declare(strict_types=1);

use App\Enums\PageBlockTypeEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_blocks', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('page_id');
            $table->unsignedBigInteger('section_id');
            $table->enum('type', array_column(PageBlockTypeEnum::cases(), 'value'));
            $table->json('configuration');
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['page_id', 'position']);
            $table->index(['section_id', 'position']);
            $table->index('is_active');

            if (config('database.default') !== 'sqlite') {
                $table->foreign('page_id')->references('id')->on('pages')->cascadeOnDelete();
                $table->foreign('section_id')->references('id')->on('page_sections')->cascadeOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_blocks');
    }
};
