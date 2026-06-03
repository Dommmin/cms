<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cookie_consents', function (Blueprint $table): void {
            $table->json('policy_version_snapshot')
                ->nullable()
                ->after('consent_version');
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->string('terms_consent_version', 64)
                ->nullable()
                ->after('ga_client_id');
            $table->string('privacy_consent_version', 64)
                ->nullable()
                ->after('terms_consent_version');
            $table->json('legal_version_snapshot')
                ->nullable()
                ->after('privacy_consent_version');
            $table->timestamp('terms_accepted_at')
                ->nullable()
                ->after('legal_version_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn([
                'terms_consent_version',
                'privacy_consent_version',
                'legal_version_snapshot',
                'terms_accepted_at',
            ]);
        });

        Schema::table('cookie_consents', function (Blueprint $table): void {
            $table->dropColumn('policy_version_snapshot');
        });
    }
};
