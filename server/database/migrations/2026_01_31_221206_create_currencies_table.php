<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 3)->unique();              // "PLN", "USD", "EUR"
            $table->string('name');                            // "Polish Złoty"
            $table->string('symbol');                          // "zł", "$", "€"
            $table->unsignedTinyInteger('decimal_places')->default(2); // PLN=2, JPY=0
            $table->boolean('is_active')->default(true);
            $table->boolean('is_base')->default(false);        // Tylko jedna base currency
            $table->timestamps();

            // Tylko jedna base currency w całej tabelce
            $table->index('is_base');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
