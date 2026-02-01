<?php

use App\Models\Attribute;
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
        Schema::create('attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Attribute::class)->constrained()->cascadeOnDelete();
            $table->string('value');
            $table->string('slug');
            $table->string('color_hex', 7)->nullable();        // "#FF0000" — tylko dla type=color
            $table->unsignedTinyInteger('position')->default(0);

            // slug unique per attribute (nie global)
            $table->unique(['attribute_id', 'slug']);
            $table->index('attribute_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute_values');
    }
};
