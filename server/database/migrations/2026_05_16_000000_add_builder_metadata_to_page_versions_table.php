<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_versions', function (Blueprint $table): void {
            $table->boolean('is_autosave')->default(false)->after('change_note');
            $table->string('source', 32)->default('manual')->after('is_autosave');
        });
    }

    public function down(): void
    {
        Schema::table('page_versions', function (Blueprint $table): void {
            $table->dropColumn(['is_autosave', 'source']);
        });
    }
};
