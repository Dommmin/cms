<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $settings = [
            ['group' => 'payments', 'key' => 'paynow_api_key', 'label' => 'Paynow API Key', 'type' => 'string', 'value' => null, 'description' => 'Api-Key from Paynow merchant panel.', 'is_public' => false],
            ['group' => 'payments', 'key' => 'paynow_signature_key', 'label' => 'Paynow Signature Key', 'type' => 'encrypted', 'value' => null, 'description' => 'Signature-Key used for Paynow API request and webhook signatures (stored encrypted).', 'is_public' => false],
            ['group' => 'payments', 'key' => 'paynow_sandbox', 'label' => 'Paynow Sandbox Mode', 'type' => 'boolean', 'value' => 'true', 'description' => 'Use Paynow sandbox environment. Disable on production.', 'is_public' => false],
        ];

        $now = now();

        foreach ($settings as $setting) {
            DB::table('settings')->insertOrIgnore([
                'group' => $setting['group'],
                'key' => $setting['key'],
                'label' => $setting['label'],
                'type' => $setting['type'],
                'value' => $setting['value'] !== null ? json_encode($setting['value']) : null,
                'description' => $setting['description'],
                'is_public' => $setting['is_public'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'paynow_api_key',
            'paynow_signature_key',
            'paynow_sandbox',
        ])->delete();
    }
};
