<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locales', function (Blueprint $table) {
            $table->string('currency_code', 3)->nullable()->after('flag_emoji');
        });
    }

    public function down(): void
    {
        Schema::table('locales', function (Blueprint $table) {
            $table->dropColumn('currency_code');
        });
    }
};
