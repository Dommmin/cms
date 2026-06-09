<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('settings')->insertOrIgnore([
            'group' => 'integrations',
            'key' => 'mailerlite_webhook_secret',
            'label' => 'MailerLite Webhook Secret',
            'type' => 'encrypted',
            'value' => null,
            'description' => 'MailerLite webhook signature verification secret key.',
            'is_public' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'mailerlite_webhook_secret')->delete();
    }
};
