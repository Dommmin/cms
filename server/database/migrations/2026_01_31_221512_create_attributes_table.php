<?php

use App\Enums\AttributeTypeEnum;
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
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            // select = dropdown, multiselect = checkboxes,
            // text = free text, numeric = liczba, color = color picker
            $table->enum('type', AttributeTypeEnum::cases())->default(AttributeTypeEnum::TEXT->value);
            $table->string('unit')->nullable();                // "cm", "kg", "GB"
            $table->boolean('is_filterable')->default(false);  // Pojawia się w filtrach
            $table->boolean('is_variant_selection')->default(false); // Tworzy warianty
            $table->unsignedTinyInteger('position')->default(0);
            $table->timestamps();

            $table->index('slug');
            $table->index('is_filterable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attributes');
    }
};
