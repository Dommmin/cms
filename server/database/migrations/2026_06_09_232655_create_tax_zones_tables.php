<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_zones', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('tax_zone_countries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tax_zone_id')->constrained('tax_zones')->cascadeOnDelete();
            $table->string('country_code', 2);
            $table->timestamps();

            $table->unique(['tax_zone_id', 'country_code']);
        });

        Schema::table('tax_rates', function (Blueprint $table): void {
            $table->foreignId('tax_zone_id')->nullable()->after('id')->constrained('tax_zones')->nullOnDelete();
            $table->string('country_code', 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('tax_rates', function (Blueprint $table): void {
            $table->dropForeign(['tax_zone_id']);
            $table->dropColumn('tax_zone_id');
            $table->string('country_code', 2)->default('PL')->change();
        });

        Schema::dropIfExists('tax_zone_countries');
        Schema::dropIfExists('tax_zones');
    }
};
