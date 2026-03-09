<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_rates', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->unsignedTinyInteger('rate');
            $table->string('country_code', 2)->default('PL');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->unique(['rate', 'country_code']);
            $table->index('country_code');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_rates');
    }
};
