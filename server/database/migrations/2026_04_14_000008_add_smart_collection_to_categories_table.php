<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->string('collection_type')->default('manual')->after('is_active');
            $table->json('rules')->nullable()->after('collection_type');
            $table->string('rules_match')->default('all')->after('rules');
        });
    }

    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->dropColumn(['collection_type', 'rules', 'rules_match']);
        });
    }
};
