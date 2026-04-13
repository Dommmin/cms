<?php

declare(strict_types=1);

use App\Enums\CampaignTriggerEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            $triggers = array_column(CampaignTriggerEnum::cases(), 'value');
            $enum = "'".implode("','", $triggers)."'";

            DB::statement("ALTER TABLE newsletter_campaigns MODIFY COLUMN `trigger` ENUM($enum) NULL");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            $oldTriggers = ['on_subscribe', 'on_first_order', 'on_birthday', 'after_purchase', 'cart_abandonment'];
            $enum = "'".implode("','", $oldTriggers)."'";

            DB::statement("ALTER TABLE newsletter_campaigns MODIFY COLUMN `trigger` ENUM($enum) NULL");
        }
    }
};
