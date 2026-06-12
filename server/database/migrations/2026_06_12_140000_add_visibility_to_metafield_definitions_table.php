<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('metafield_definitions', function (Blueprint $table): void {
            $table->string('visibility', 32)->default('admin_only')->after('type');
            $table->boolean('storefront_exposed')->default(false)->after('visibility');
        });
    }

    public function down(): void
    {
        Schema::table('metafield_definitions', function (Blueprint $table): void {
            $table->dropColumn(['visibility', 'storefront_exposed']);
        });
    }
};
