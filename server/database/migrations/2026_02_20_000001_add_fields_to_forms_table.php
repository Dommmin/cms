<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('forms', function (Blueprint $table): void {
            $table->string('notification_email')->nullable()->after('notify_emails');
            $table->text('success_message')->nullable()->after('notification_email');
            $table->boolean('allow_multiple')->default(true)->after('success_message');
        });
    }

    public function down(): void
    {
        Schema::table('forms', function (Blueprint $table): void {
            $table->dropColumn(['notification_email', 'success_message', 'allow_multiple']);
        });
    }
};
