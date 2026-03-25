<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Converts translatable content columns to JSON to support
 * spatie/laravel-translatable multi-language content.
 *
 * Strategy per column:
 *  1. Wrap the existing value in {"en": "value"} (preserve current data as English).
 *  2. Change column type to json (nullable).
 */
return new class extends Migration
{
    /** @var array<string, array<int, string>> */
    private array $columns = [
        'products' => ['name', 'description', 'short_description'],
        'categories' => ['name', 'description'],
        'blog_posts' => ['title', 'excerpt', 'content'],
        'pages' => ['title', 'excerpt', 'content', 'rich_content'],
    ];

    public function up(): void
    {
        foreach ($this->columns as $table => $cols) {
            foreach ($cols as $col) {
                // Wrap existing non-null values as {"en": "value"}
                DB::statement(
                    sprintf("UPDATE `%s` SET `%s` = JSON_OBJECT('en', `%s`) WHERE `%s` IS NOT NULL", $table, $col, $col, $col),
                );

                // Change column type to json (nullable)
                Schema::table($table, function (Blueprint $blueprint) use ($col): void {
                    $blueprint->json($col)->nullable()->change();
                });
            }
        }
    }

    public function down(): void
    {
        foreach ($this->columns as $table => $cols) {
            foreach ($cols as $col) {
                // Revert to text — extract english value back
                Schema::table($table, function (Blueprint $blueprint) use ($col): void {
                    $blueprint->text($col)->nullable()->change();
                });

                DB::statement(
                    sprintf("UPDATE `%s` SET `%s` = JSON_UNQUOTE(JSON_EXTRACT(`%s`, '\$.en')) WHERE `%s` IS NOT NULL", $table, $col, $col, $col),
                );
            }
        }
    }
};
