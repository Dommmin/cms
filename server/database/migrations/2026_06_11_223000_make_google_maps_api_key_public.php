<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('settings')
            ->where('group', 'integrations')
            ->where('key', 'google_maps_api_key')
            ->update(['is_public' => true]);
    }

    public function down(): void
    {
        DB::table('settings')
            ->where('group', 'integrations')
            ->where('key', 'google_maps_api_key')
            ->update(['is_public' => false]);
    }
};
