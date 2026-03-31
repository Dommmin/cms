<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Convert existing plain-string values to JSON {"en": "...", "pl": "..."}
        DB::statement('UPDATE product_variants SET name = JSON_OBJECT("en", name, "pl", name) WHERE name NOT LIKE "{%"');

        Schema::table('product_variants', function (Blueprint $table): void {
            $table->json('name')->change();
        });
    }

    public function down(): void
    {
        // Extract the "en" translation back to a plain string
        DB::statement('UPDATE product_variants SET name = JSON_UNQUOTE(JSON_EXTRACT(name, "$.en")) WHERE name LIKE "{%"');

        Schema::table('product_variants', function (Blueprint $table): void {
            $table->string('name')->change();
        });
    }
};
