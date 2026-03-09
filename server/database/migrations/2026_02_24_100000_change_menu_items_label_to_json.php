<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: add temporary JSON column
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->json('label_localized')->nullable()->after('label');
        });

        // Step 2: migrate existing string data → {"en": "<value>"}
        DB::statement("UPDATE menu_items SET label_localized = JSON_OBJECT('en', label)");

        // Step 3: drop old string column
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->dropColumn('label');
        });

        // Step 4: rename temporary column to label
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->renameColumn('label_localized', 'label');
        });
    }

    public function down(): void
    {
        // Step 1: add temp string column
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->string('label_old')->nullable()->after('label');
        });

        // Step 2: extract 'en' value back
        DB::statement("UPDATE menu_items SET label_old = JSON_UNQUOTE(JSON_EXTRACT(label, '$.en'))");

        // Step 3: drop json column
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->dropColumn('label');
        });

        // Step 4: rename and make not nullable
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->renameColumn('label_old', 'label');
        });

        Schema::table('menu_items', function (Blueprint $table): void {
            $table->string('label')->nullable(false)->change();
        });
    }
};
