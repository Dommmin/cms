<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $settings = [
            [
                'group' => 'newsletter',
                'key' => 'newsletter_provider',
                'label' => 'Newsletter Provider',
                'type' => 'string',
                'value' => json_encode('mailerlite'),
                'description' => 'Active external mailing list provider (mailerlite, mailchimp, or klaviyo).',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group' => 'newsletter',
                'key' => 'mailchimp_api_key',
                'label' => 'Mailchimp API Key',
                'type' => 'encrypted',
                'value' => null,
                'description' => 'Mailchimp V3 API Key (usually ends with -usX).',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group' => 'newsletter',
                'key' => 'mailchimp_list_id',
                'label' => 'Mailchimp Audience/List ID',
                'type' => 'string',
                'value' => null,
                'description' => 'Target audience/list ID for Mailchimp subscribers.',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group' => 'newsletter',
                'key' => 'klaviyo_api_key',
                'label' => 'Klaviyo API Key',
                'type' => 'encrypted',
                'value' => null,
                'description' => 'Klaviyo Private API Key (Klaviyo V3 API).',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group' => 'newsletter',
                'key' => 'klaviyo_list_id',
                'label' => 'Klaviyo List ID',
                'type' => 'string',
                'value' => null,
                'description' => 'Target list ID for Klaviyo profiles.',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->insertOrIgnore($setting);
        }
    }

    public function down(): void
    {
        DB::table('settings')
            ->where('group', 'newsletter')
            ->whereIn('key', [
                'newsletter_provider',
                'mailchimp_api_key',
                'mailchimp_list_id',
                'klaviyo_api_key',
                'klaviyo_list_id',
            ])
            ->delete();
    }
};
