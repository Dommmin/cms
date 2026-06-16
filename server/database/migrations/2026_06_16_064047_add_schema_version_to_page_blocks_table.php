<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_blocks', function (Blueprint $table): void {
            $table->unsignedSmallInteger('schema_version')->default(1)->after('configuration');
        });
    }

    public function down(): void
    {
        Schema::table('page_blocks', function (Blueprint $table): void {
            $table->dropColumn('schema_version');
        });
    }
};
