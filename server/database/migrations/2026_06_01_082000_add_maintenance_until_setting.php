<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update maintenance_mode to be public so client storefront can read it
        DB::table('settings')
            ->where('group', 'general')
            ->where('key', 'maintenance_mode')
            ->update(['is_public' => true]);

        // Insert new maintenance_until setting
        $now = now();
        DB::table('settings')->insertOrIgnore([
            'group' => 'general',
            'key' => 'maintenance_until',
            'label' => 'Maintenance Until',
            'type' => 'string',
            'value' => null,
            'description' => 'Expected date and time when the site will be back (e.g. 2026-06-05 12:00).',
            'is_public' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        DB::table('settings')
            ->where('group', 'general')
            ->where('key', 'maintenance_mode')
            ->update(['is_public' => false]);

        DB::table('settings')
            ->where('group', 'general')
            ->where('key', 'maintenance_until')
            ->delete();
    }
};
