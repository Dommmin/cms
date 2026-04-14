<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metafields', function (Blueprint $table): void {
            $table->id();
            $table->morphs('owner');
            $table->string('namespace', 64);
            $table->string('key', 64);
            $table->string('type', 32);
            $table->text('value')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            $table->unique(['owner_type', 'owner_id', 'namespace', 'key']);
            $table->index(['owner_type', 'namespace', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metafields');
    }
};
