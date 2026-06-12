<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement(
            "ALTER TABLE attributes MODIFY COLUMN type ENUM('text', 'select', 'multiselect', 'numeric', 'boolean', 'color', 'date') NOT NULL DEFAULT 'text'"
        );
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement(
            "ALTER TABLE attributes MODIFY COLUMN type ENUM('text', 'select', 'multiselect', 'numeric', 'color') NOT NULL DEFAULT 'text'"
        );
    }
};
