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
            ->whereIn('key', [
                'stripe_public_key',
                'stripe_secret_key',
                'stripe_webhook_secret',
            ])
            ->update(['group' => 'payments']);
    }

    public function down(): void
    {
        DB::table('settings')
            ->where('group', 'payments')
            ->whereIn('key', [
                'stripe_public_key',
                'stripe_secret_key',
                'stripe_webhook_secret',
            ])
            ->update(['group' => 'integrations']);
    }
};
