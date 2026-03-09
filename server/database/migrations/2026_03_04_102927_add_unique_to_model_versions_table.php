<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;

/**
 * This migration is a no-op.
 * The unique constraint was included in 2026_03_04_101731_create_model_versions_table.php
 * after that migration was re-created with dropIfExists.
 */
return new class extends Migration
{
    public function up(): void
    {
        // No-op: constraint already added in create_model_versions_table migration.
    }

    public function down(): void
    {
        // No-op.
    }
};
