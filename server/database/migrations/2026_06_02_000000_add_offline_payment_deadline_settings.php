<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('settings')->insertOrIgnore([
            'group' => 'payments',
            'key' => 'offline_payment_deadline_days',
            'label' => 'Offline Payment Deadline (Days)',
            'type' => 'integer',
            'value' => json_encode(5),
            'description' => 'Number of days before unpaid bank transfer or cash on delivery orders are automatically cancelled.',
            'is_public' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('settings')
            ->where('group', 'payments')
            ->where('key', 'offline_payment_deadline_days')
            ->delete();
    }
};
