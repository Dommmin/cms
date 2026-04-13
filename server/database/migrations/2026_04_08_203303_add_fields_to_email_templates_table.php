<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_templates', function (Blueprint $table): void {
            $table->string('name')->after('id');
            $table->string('key')->unique()->after('name');
            $table->string('subject')->after('key');
            $table->longText('body')->after('subject');
            $table->text('description')->nullable()->after('body');
            $table->boolean('is_active')->default(true)->after('description');
            $table->json('variables')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('email_templates', function (Blueprint $table): void {
            $table->dropColumn(['name', 'key', 'subject', 'body', 'description', 'is_active', 'variables']);
        });
    }
};
