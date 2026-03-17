<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add new JSON translation columns
        Schema::table('shipping_methods', function (Blueprint $table) {
            $table->json('name_new')->nullable()->after('name');
            $table->json('description_new')->nullable()->after('description');
        });

        // Migrate existing string values to JSON {"en": "value"}
        DB::statement('UPDATE shipping_methods SET name_new = JSON_OBJECT("en", name)');
        DB::statement('UPDATE shipping_methods SET description_new = JSON_OBJECT("en", description) WHERE description IS NOT NULL');

        // Drop old string columns and rename JSON ones
        Schema::table('shipping_methods', function (Blueprint $table) {
            $table->dropColumn(['name', 'description']);
        });

        Schema::table('shipping_methods', function (Blueprint $table) {
            $table->renameColumn('name_new', 'name');
            $table->renameColumn('description_new', 'description');
        });
    }

    public function down(): void
    {
        Schema::table('shipping_methods', function (Blueprint $table) {
            $table->string('name_old')->nullable()->after('name');
            $table->string('description_old')->nullable()->after('description');
        });

        DB::statement("UPDATE shipping_methods SET name_old = JSON_UNQUOTE(JSON_EXTRACT(name, '$.en'))");
        DB::statement("UPDATE shipping_methods SET description_old = JSON_UNQUOTE(JSON_EXTRACT(description, '$.en')) WHERE description IS NOT NULL");

        Schema::table('shipping_methods', function (Blueprint $table) {
            $table->dropColumn(['name', 'description']);
        });

        Schema::table('shipping_methods', function (Blueprint $table) {
            $table->renameColumn('name_old', 'name');
            $table->renameColumn('description_old', 'description');
        });
    }
};
