<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('settings')->insertOrIgnore([
            'group' => 'integrations',
            'key' => 'gus_api_key',
            'label' => 'GUS / REGON API Key',
            'type' => 'encrypted',
            'value' => null,
            'description' => 'API key for the GUS REGON database (stat.gov.pl). Used to look up company data by NIP. Get a key at https://api.stat.gov.pl/Home/RegonApi.',
            'is_public' => false,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('group', 'integrations')->where('key', 'gus_api_key')->delete();
    }
};
