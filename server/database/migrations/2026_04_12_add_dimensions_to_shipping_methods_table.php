<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shipping_methods', function (Blueprint $table): void {
            $table->unsignedSmallInteger('max_length_cm')->nullable()->after('max_weight');
            $table->unsignedSmallInteger('max_width_cm')->nullable()->after('max_length_cm');
            $table->unsignedSmallInteger('max_depth_cm')->nullable()->after('max_width_cm');
            $table->boolean('requires_signature')->default(false)->after('max_depth_cm');
            $table->boolean('insurance_available')->default(false)->after('requires_signature');
        });
    }

    public function down(): void
    {
        Schema::table('shipping_methods', function (Blueprint $table): void {
            $table->dropColumn(['max_length_cm', 'max_width_cm', 'max_depth_cm', 'requires_signature', 'insurance_available']);
        });
    }
};
