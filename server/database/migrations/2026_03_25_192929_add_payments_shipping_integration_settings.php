<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $settings = [
            // ── Payments — PayU ──────────────────────────────────────────────
            ['group' => 'payments', 'key' => 'payu_client_id',     'label' => 'PayU Client ID',     'type' => 'string',    'value' => null,   'description' => 'OAuth2 client_id from PayU merchant panel.',                           'is_public' => false],
            ['group' => 'payments', 'key' => 'payu_client_secret', 'label' => 'PayU Client Secret', 'type' => 'encrypted', 'value' => null,   'description' => 'OAuth2 client_secret from PayU merchant panel (stored encrypted).',   'is_public' => false],
            ['group' => 'payments', 'key' => 'payu_pos_id',        'label' => 'PayU POS ID',        'type' => 'string',    'value' => null,   'description' => 'Point of Sale identifier from PayU merchant panel.',                   'is_public' => false],
            ['group' => 'payments', 'key' => 'payu_md5_key',       'label' => 'PayU MD5 Key',       'type' => 'encrypted', 'value' => null,   'description' => 'MD5 signature key for webhook verification (stored encrypted).',      'is_public' => false],
            ['group' => 'payments', 'key' => 'payu_sandbox',       'label' => 'PayU Sandbox Mode',  'type' => 'boolean',   'value' => 'true', 'description' => 'Use PayU sandbox environment. Disable on production.',                'is_public' => false],

            // ── Payments — Przelewy24 ────────────────────────────────────────
            ['group' => 'payments', 'key' => 'p24_merchant_id', 'label' => 'P24 Merchant ID', 'type' => 'string',    'value' => null,   'description' => 'Przelewy24 merchant identifier.',                                     'is_public' => false],
            ['group' => 'payments', 'key' => 'p24_pos_id',      'label' => 'P24 POS ID',      'type' => 'string',    'value' => null,   'description' => 'Przelewy24 point of sale identifier.',                                'is_public' => false],
            ['group' => 'payments', 'key' => 'p24_crc',         'label' => 'P24 CRC Key',     'type' => 'encrypted', 'value' => null,   'description' => 'Przelewy24 CRC key for signature verification (stored encrypted).',   'is_public' => false],
            ['group' => 'payments', 'key' => 'p24_api_key',     'label' => 'P24 API Key',     'type' => 'encrypted', 'value' => null,   'description' => 'Przelewy24 REST API key (stored encrypted).',                         'is_public' => false],
            ['group' => 'payments', 'key' => 'p24_sandbox',     'label' => 'P24 Sandbox Mode','type' => 'boolean',   'value' => 'true', 'description' => 'Use Przelewy24 sandbox environment. Disable on production.',           'is_public' => false],

            // ── Payments — Bank Transfer ─────────────────────────────────────
            ['group' => 'payments', 'key' => 'bank_transfer_account_name', 'label' => 'Account Holder Name', 'type' => 'string', 'value' => null, 'description' => 'Bank account holder name shown to customers.', 'is_public' => true],
            ['group' => 'payments', 'key' => 'bank_transfer_iban',         'label' => 'IBAN',                'type' => 'string', 'value' => null, 'description' => 'Bank account IBAN shown to customers.',         'is_public' => true],
            ['group' => 'payments', 'key' => 'bank_transfer_swift',        'label' => 'SWIFT / BIC',         'type' => 'string', 'value' => null, 'description' => 'Bank SWIFT/BIC code shown to customers.',       'is_public' => true],
            ['group' => 'payments', 'key' => 'bank_transfer_bank_name',    'label' => 'Bank Name',           'type' => 'string', 'value' => null, 'description' => 'Bank name shown to customers.',                 'is_public' => true],

            // ── Shipping — Furgonetka ────────────────────────────────────────
            ['group' => 'shipping', 'key' => 'furgonetka_client_id',           'label' => 'Furgonetka Client ID',     'type' => 'string',    'value' => null,    'description' => 'Furgonetka OAuth2 client_id.',                              'is_public' => false],
            ['group' => 'shipping', 'key' => 'furgonetka_client_secret',       'label' => 'Furgonetka Client Secret', 'type' => 'encrypted', 'value' => null,    'description' => 'Furgonetka OAuth2 client_secret (stored encrypted).',        'is_public' => false],
            ['group' => 'shipping', 'key' => 'furgonetka_sender_name',         'label' => 'Sender Name',              'type' => 'string',    'value' => null,    'description' => 'Full name of the sender shown on shipping labels.',          'is_public' => false],
            ['group' => 'shipping', 'key' => 'furgonetka_sender_email',        'label' => 'Sender Email',             'type' => 'string',    'value' => null,    'description' => 'Sender e-mail for shipping notifications.',                  'is_public' => false],
            ['group' => 'shipping', 'key' => 'furgonetka_sender_phone',        'label' => 'Sender Phone',             'type' => 'string',    'value' => null,    'description' => 'Sender phone number for carrier contact.',                   'is_public' => false],
            ['group' => 'shipping', 'key' => 'furgonetka_sender_street',       'label' => 'Sender Street',            'type' => 'string',    'value' => null,    'description' => 'Sender street address for pickup.',                          'is_public' => false],
            ['group' => 'shipping', 'key' => 'furgonetka_sender_city',         'label' => 'Sender City',              'type' => 'string',    'value' => null,    'description' => 'Sender city for pickup.',                                    'is_public' => false],
            ['group' => 'shipping', 'key' => 'furgonetka_sender_postal_code',  'label' => 'Sender Postal Code',       'type' => 'string',    'value' => null,    'description' => 'Sender postal code for pickup.',                             'is_public' => false],
            ['group' => 'shipping', 'key' => 'furgonetka_sender_country_code', 'label' => 'Sender Country Code',      'type' => 'string',    'value' => '"PL"',  'description' => 'ISO 3166-1 alpha-2 sender country code (e.g. PL).',          'is_public' => false],

            // ── Shipping — InPost ────────────────────────────────────────────
            ['group' => 'shipping', 'key' => 'inpost_shipx_token',           'label' => 'InPost ShipX Token',       'type' => 'encrypted', 'value' => null, 'description' => 'InPost ShipX API token (stored encrypted).',               'is_public' => false],
            ['group' => 'shipping', 'key' => 'inpost_shipx_organization_id', 'label' => 'InPost Organization ID',   'type' => 'string',    'value' => null, 'description' => 'InPost ShipX organization identifier.',                    'is_public' => false],
            ['group' => 'shipping', 'key' => 'inpost_geowidget_token',       'label' => 'InPost Geowidget Token',   'type' => 'string',    'value' => null, 'description' => 'Public token for the InPost locker-selector map widget.',   'is_public' => true],

            // ── Integrations — Social Login ──────────────────────────────────
            ['group' => 'integrations', 'key' => 'google_client_id',     'label' => 'Google OAuth Client ID',     'type' => 'string',    'value' => null, 'description' => 'Google OAuth2 client_id for social login.',                  'is_public' => false],
            ['group' => 'integrations', 'key' => 'google_client_secret', 'label' => 'Google OAuth Client Secret', 'type' => 'encrypted', 'value' => null, 'description' => 'Google OAuth2 client_secret (stored encrypted).',            'is_public' => false],
            ['group' => 'integrations', 'key' => 'github_client_id',     'label' => 'GitHub OAuth Client ID',     'type' => 'string',    'value' => null, 'description' => 'GitHub OAuth2 client_id for social login.',                  'is_public' => false],
            ['group' => 'integrations', 'key' => 'github_client_secret', 'label' => 'GitHub OAuth Client Secret', 'type' => 'encrypted', 'value' => null, 'description' => 'GitHub OAuth2 client_secret (stored encrypted).',            'is_public' => false],

            // ── Integrations — Cloudflare Turnstile ──────────────────────────
            ['group' => 'integrations', 'key' => 'cloudflare_turnstile_site_key',   'label' => 'Turnstile Site Key',   'type' => 'string',    'value' => null, 'description' => 'Cloudflare Turnstile public site key (rendered in browser).', 'is_public' => true],
            ['group' => 'integrations', 'key' => 'cloudflare_turnstile_secret_key', 'label' => 'Turnstile Secret Key', 'type' => 'encrypted', 'value' => null, 'description' => 'Cloudflare Turnstile secret key for server-side verification.', 'is_public' => false],
        ];

        $now = now();

        foreach ($settings as $setting) {
            DB::table('settings')->insertOrIgnore([
                'group'       => $setting['group'],
                'key'         => $setting['key'],
                'label'       => $setting['label'],
                'type'        => $setting['type'],
                'value'       => $setting['value'] !== null ? json_encode($setting['value']) : null,
                'description' => $setting['description'],
                'is_public'   => $setting['is_public'],
                'created_at'  => $now,
                'updated_at'  => $now,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('group', ['payments', 'shipping'])->delete();

        DB::table('settings')->whereIn('key', [
            'google_client_id', 'google_client_secret',
            'github_client_id', 'github_client_secret',
            'cloudflare_turnstile_site_key', 'cloudflare_turnstile_secret_key',
        ])->delete();
    }
};
