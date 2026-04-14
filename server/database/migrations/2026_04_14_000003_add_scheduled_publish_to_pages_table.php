<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->timestamp('scheduled_publish_at')->nullable()->after('published_at');
            $table->timestamp('scheduled_unpublish_at')->nullable()->after('scheduled_publish_at');
        });
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table): void {
            $table->dropColumn(['scheduled_publish_at', 'scheduled_unpublish_at']);
        });
    }
};
