<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wishlists', function (Blueprint $table): void {
            $table->string('session_token', 64)->nullable()->unique()->after('customer_id');
            $table->unsignedBigInteger('customer_id')->nullable()->change();
        });

        Schema::table('wishlists', function (Blueprint $table): void {
            $table->index('session_token');
        });
    }

    public function down(): void
    {
        Schema::table('wishlists', function (Blueprint $table): void {
            $table->dropIndex(['session_token']);
            $table->dropColumn('session_token');
            $table->unsignedBigInteger('customer_id')->nullable(false)->change();
        });
    }
};