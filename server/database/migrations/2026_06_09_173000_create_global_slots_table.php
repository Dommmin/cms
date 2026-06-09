<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('global_slots', function (Blueprint $table): void {
            $table->id();
            $table->string('location'); // SlotLocationEnum value
            $table->foreignId('reusable_block_id')->nullable()->constrained('reusable_blocks')->nullOnDelete();
            $table->string('label');
            $table->json('configuration')->nullable(); // standalone or override config
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->json('settings')->nullable(); // slot level styling settings
            $table->timestamps();

            $table->index(['location', 'is_active', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('global_slots');
    }
};
