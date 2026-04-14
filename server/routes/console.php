<?php

declare(strict_types=1);

use App\Jobs\SendAbandonedCartEmails;
use App\Jobs\SendLowStockAlerts;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function (): void {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('blog:publish-scheduled')->everyMinute();
Schedule::command('cms:process-scheduled-pages')->everyMinute();
Schedule::command('activitylog:clean')->weekly();
Schedule::command('cart:clean')->daily();
Schedule::job(new SendAbandonedCartEmails)->hourly();
Schedule::job(new SendLowStockAlerts)->daily();
Schedule::command('user:prune')->monthly();
Schedule::command('marketing:process')->daily();
Schedule::command('subscriptions:process')->hourly();
Schedule::command('flash-sales:deactivate-expired')->everyFiveMinutes();
