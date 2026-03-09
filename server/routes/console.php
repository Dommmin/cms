<?php

declare(strict_types=1);

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('blog:publish-scheduled')->everyMinute();
Schedule::command('activitylog:clean')->weekly();
Schedule::command('cart:clean')->daily();
Schedule::job(new App\Jobs\SendAbandonedCartEmails)->hourly();
Schedule::job(new App\Jobs\SendLowStockAlerts)->daily();
Schedule::command('user:prune')->monthly();
