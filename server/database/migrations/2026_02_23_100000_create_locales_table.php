<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locales', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->string('native_name');
            $table->string('flag_emoji', 10)->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locales');
    }
};
