<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metafield_definitions', function (Blueprint $table): void {
            $table->id();
            $table->string('owner_type');
            $table->string('namespace', 64);
            $table->string('key', 64);
            $table->string('name');
            $table->string('type', 32);
            $table->text('description')->nullable();
            $table->json('validations')->nullable();
            $table->boolean('pinned')->default(false);
            $table->integer('position')->default(0);
            $table->timestamps();
            $table->unique(['owner_type', 'namespace', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metafield_definitions');
    }
};
