<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $settings = [
            // ── General ─────────────────────────────────────────────────────
            ['group' => 'general', 'key' => 'site_name',        'label' => 'Site Name',                    'type' => 'string',    'value' => null,                          'description' => 'Name displayed in the browser title bar and emails.',                                                         'is_public' => true],
            ['group' => 'general', 'key' => 'site_url',         'label' => 'Site URL',                     'type' => 'string',    'value' => null,                          'description' => 'Public URL of the website (no trailing slash).',                                                               'is_public' => true],
            ['group' => 'general', 'key' => 'site_description', 'label' => 'Site Description',             'type' => 'string',    'value' => null,                          'description' => 'Short description used in meta tags and emails.',                                                              'is_public' => true],
            ['group' => 'general', 'key' => 'contact_email',    'label' => 'Contact Email',                'type' => 'string',    'value' => null,                          'description' => 'Public contact email address.',                                                                                'is_public' => true],
            ['group' => 'general', 'key' => 'contact_phone',    'label' => 'Contact Phone',                'type' => 'string',    'value' => null,                          'description' => 'Public contact phone number.',                                                                                 'is_public' => true],
            ['group' => 'general', 'key' => 'contact_address',  'label' => 'Contact Address',              'type' => 'string',    'value' => null,                          'description' => 'Company address shown in emails and footer.',                                                                   'is_public' => true],
            ['group' => 'general', 'key' => 'maintenance_mode', 'label' => 'Maintenance Mode',             'type' => 'boolean',   'value' => 'false',                       'description' => 'Put the public site into maintenance mode.',                                                                   'is_public' => false],

            // ── Mail ────────────────────────────────────────────────────────
            ['group' => 'mail', 'key' => 'mail_driver',         'label' => 'Mail Driver',                  'type' => 'string',    'value' => 'log',                         'description' => 'Transport driver: smtp, ses, mailgun, postmark, log.',                                                        'is_public' => false],
            ['group' => 'mail', 'key' => 'mail_host',           'label' => 'SMTP Host',                    'type' => 'string',    'value' => null,                          'description' => 'SMTP server hostname.',                                                                                        'is_public' => false],
            ['group' => 'mail', 'key' => 'mail_port',           'label' => 'SMTP Port',                    'type' => 'integer',   'value' => '587',                         'description' => 'SMTP server port (usually 587 or 465).',                                                                      'is_public' => false],
            ['group' => 'mail', 'key' => 'mail_encryption',     'label' => 'Encryption',                   'type' => 'string',    'value' => 'tls',                         'description' => 'Connection encryption: tls, ssl, or leave empty.',                                                            'is_public' => false],
            ['group' => 'mail', 'key' => 'mail_username',       'label' => 'SMTP Username',                'type' => 'string',    'value' => null,                          'description' => 'SMTP authentication username.',                                                                                'is_public' => false],
            ['group' => 'mail', 'key' => 'mail_password',       'label' => 'SMTP Password',                'type' => 'encrypted', 'value' => null,                          'description' => 'SMTP authentication password (stored encrypted).',                                                            'is_public' => false],
            ['group' => 'mail', 'key' => 'mail_from_address',   'label' => 'From Email',                   'type' => 'string',    'value' => null,                          'description' => 'Default "From" email address for outgoing mail.',                                                              'is_public' => false],
            ['group' => 'mail', 'key' => 'mail_from_name',      'label' => 'From Name',                    'type' => 'string',    'value' => null,                          'description' => 'Default sender name for outgoing mail.',                                                                       'is_public' => false],

            // ── SEO ─────────────────────────────────────────────────────────
            ['group' => 'seo', 'key' => 'meta_title',                'label' => 'Default Meta Title',          'type' => 'string',  'value' => null,              'description' => 'Fallback page title for pages without a specific title.',                  'is_public' => true],
            ['group' => 'seo', 'key' => 'meta_description',          'label' => 'Default Meta Description',    'type' => 'string',  'value' => null,              'description' => 'Fallback meta description (up to 160 chars).',                            'is_public' => true],
            ['group' => 'seo', 'key' => 'google_analytics_id',       'label' => 'Google Analytics ID',         'type' => 'string',  'value' => null,              'description' => 'Google Analytics 4 Measurement ID (e.g. G-XXXXXXXX).',                    'is_public' => true],
            ['group' => 'seo', 'key' => 'google_tag_manager',        'label' => 'Google Tag Manager ID',       'type' => 'string',  'value' => null,              'description' => 'Google Tag Manager container ID (e.g. GTM-XXXXXXX).',                    'is_public' => true],
            ['group' => 'seo', 'key' => 'robots_txt',                'label' => 'robots.txt content',          'type' => 'string',  'value' => "User-agent: *\nAllow: /", 'description' => 'Contents of the robots.txt file.',                              'is_public' => false],
            ['group' => 'seo', 'key' => 'og_image',                  'label' => 'Default OG Image',            'type' => 'string',  'value' => null,              'description' => 'Default Open Graph image URL for social sharing.',                        'is_public' => true],
            ['group' => 'seo', 'key' => 'twitter_handle',            'label' => 'Twitter / X Handle',          'type' => 'string',  'value' => null,              'description' => 'Twitter/X handle (e.g. @yourhandle).',                                   'is_public' => true],
            ['group' => 'seo', 'key' => 'google_site_verification',  'label' => 'Google Site Verification',    'type' => 'string',  'value' => null,              'description' => 'Google Search Console verification meta tag value.',                      'is_public' => true],
            ['group' => 'seo', 'key' => 'bing_site_verification',    'label' => 'Bing Site Verification',      'type' => 'string',  'value' => null,              'description' => 'Bing Webmaster Tools verification meta tag value.',                       'is_public' => true],
            ['group' => 'seo', 'key' => 'disable_indexing',          'label' => 'Disable Search Indexing',     'type' => 'boolean', 'value' => 'false',           'description' => 'Emergency kill switch — adds noindex to all pages.',                     'is_public' => true],

            // ── Social ──────────────────────────────────────────────────────
            ['group' => 'social', 'key' => 'facebook',  'label' => 'Facebook URL',    'type' => 'string', 'value' => null, 'description' => 'Full URL to your Facebook page.',         'is_public' => true],
            ['group' => 'social', 'key' => 'instagram', 'label' => 'Instagram URL',   'type' => 'string', 'value' => null, 'description' => 'Full URL to your Instagram profile.',      'is_public' => true],
            ['group' => 'social', 'key' => 'twitter',   'label' => 'Twitter / X URL', 'type' => 'string', 'value' => null, 'description' => 'Full URL to your Twitter/X profile.',     'is_public' => true],
            ['group' => 'social', 'key' => 'linkedin',  'label' => 'LinkedIn URL',    'type' => 'string', 'value' => null, 'description' => 'Full URL to your LinkedIn company page.', 'is_public' => true],
            ['group' => 'social', 'key' => 'youtube',   'label' => 'YouTube URL',     'type' => 'string', 'value' => null, 'description' => 'Full URL to your YouTube channel.',        'is_public' => true],
            ['group' => 'social', 'key' => 'tiktok',    'label' => 'TikTok URL',      'type' => 'string', 'value' => null, 'description' => 'Full URL to your TikTok profile.',         'is_public' => true],

            // ── Ecommerce ────────────────────────────────────────────────────
            ['group' => 'ecommerce', 'key' => 'currency_code',            'label' => 'Default Currency',          'type' => 'string',  'value' => 'USD',  'description' => 'ISO 4217 currency code (e.g. USD, EUR, PLN).',             'is_public' => true],
            ['group' => 'ecommerce', 'key' => 'currency_symbol',          'label' => 'Currency Symbol',           'type' => 'string',  'value' => '$',    'description' => 'Symbol displayed next to prices.',                         'is_public' => true],
            ['group' => 'ecommerce', 'key' => 'tax_rate',                 'label' => 'Default Tax Rate (%)',      'type' => 'integer', 'value' => '23',   'description' => 'Default VAT/tax rate applied to products.',                'is_public' => false],
            ['group' => 'ecommerce', 'key' => 'free_shipping_threshold',  'label' => 'Free Shipping From',        'type' => 'integer', 'value' => '100',  'description' => 'Order subtotal above which shipping is free (0 = never).', 'is_public' => true],
            ['group' => 'ecommerce', 'key' => 'shipping_cost',            'label' => 'Default Shipping Cost',     'type' => 'integer', 'value' => '10',   'description' => 'Flat shipping fee when threshold is not met.',              'is_public' => true],
            ['group' => 'ecommerce', 'key' => 'low_stock_threshold',      'label' => 'Low Stock Alert Threshold', 'type' => 'integer', 'value' => '5',    'description' => 'Warn when product stock falls below this number.',          'is_public' => false],
            ['group' => 'ecommerce', 'key' => 'reviews_enabled',          'label' => 'Product Reviews',           'type' => 'boolean', 'value' => 'true', 'description' => 'Allow customers to leave product reviews.',                 'is_public' => true],
            ['group' => 'ecommerce', 'key' => 'reviews_require_purchase', 'label' => 'Reviews require purchase',  'type' => 'boolean', 'value' => 'true', 'description' => 'Only allow reviews from verified buyers.',                  'is_public' => false],
            ['group' => 'ecommerce', 'key' => 'guest_checkout',           'label' => 'Guest Checkout',            'type' => 'boolean', 'value' => 'true', 'description' => 'Allow purchases without creating an account.',              'is_public' => true],

            // ── Cookie Consent ───────────────────────────────────────────────
            ['group' => 'cookie', 'key' => 'banner_title',          'label' => 'Banner Title',           'type' => 'string', 'value' => 'We use cookies',                                                                              'description' => 'Heading shown in the cookie consent banner.',                                    'is_public' => true],
            ['group' => 'cookie', 'key' => 'banner_description',    'label' => 'Banner Description',     'type' => 'string', 'value' => 'We use cookies to improve your experience, analyse traffic, and personalise content.',        'description' => 'Short description shown in the banner.',                                         'is_public' => true],
            ['group' => 'cookie', 'key' => 'privacy_policy_url',    'label' => 'Privacy Policy URL',     'type' => 'string', 'value' => '/privacy-policy',                                                                             'description' => 'Link to the Privacy Policy page (shown in banner).',                             'is_public' => true],
            ['group' => 'cookie', 'key' => 'cookie_policy_url',     'label' => 'Cookie Policy URL',      'type' => 'string', 'value' => '/cookie-policy',                                                                              'description' => 'Link to the Cookie Policy page (shown in banner).',                              'is_public' => true],
            ['group' => 'cookie', 'key' => 'analytics_description', 'label' => 'Analytics Description',  'type' => 'string', 'value' => 'Help us understand how visitors use the site (e.g. Google Analytics).',                     'description' => 'Description of analytics cookies shown in granular view.',                       'is_public' => true],
            ['group' => 'cookie', 'key' => 'marketing_description', 'label' => 'Marketing Description',  'type' => 'string', 'value' => 'Used to show relevant ads and measure their effectiveness (e.g. Google Ads, Meta Pixel).',  'description' => 'Description of marketing cookies shown in granular view.',                       'is_public' => true],
            ['group' => 'cookie', 'key' => 'consent_version',       'label' => 'Consent Version',        'type' => 'string', 'value' => '1.0',                                                                                         'description' => 'Bump this value to force all users to re-consent (e.g. after adding new cookies).', 'is_public' => true],

            // ── Integrations ─────────────────────────────────────────────────
            ['group' => 'integrations', 'key' => 'stripe_public_key',     'label' => 'Stripe Public Key',     'type' => 'string',    'value' => null, 'description' => 'Stripe publishable key (pk_live_... or pk_test_...).',   'is_public' => false],
            ['group' => 'integrations', 'key' => 'stripe_secret_key',     'label' => 'Stripe Secret Key',     'type' => 'encrypted', 'value' => null, 'description' => 'Stripe secret key — stored encrypted.',                  'is_public' => false],
            ['group' => 'integrations', 'key' => 'stripe_webhook_secret', 'label' => 'Stripe Webhook Secret', 'type' => 'encrypted', 'value' => null, 'description' => 'Stripe webhook signing secret — stored encrypted.',       'is_public' => false],
            ['group' => 'integrations', 'key' => 'google_maps_api_key',   'label' => 'Google Maps API Key',   'type' => 'encrypted', 'value' => null, 'description' => 'Google Maps JavaScript API key.',                        'is_public' => false],
            ['group' => 'integrations', 'key' => 'recaptcha_site_key',    'label' => 'reCAPTCHA Site Key',    'type' => 'string',    'value' => null, 'description' => 'Google reCAPTCHA v3 site key (public).',                  'is_public' => true],
            ['group' => 'integrations', 'key' => 'recaptcha_secret_key',  'label' => 'reCAPTCHA Secret Key',  'type' => 'encrypted', 'value' => null, 'description' => 'Google reCAPTCHA v3 server-side secret.',                 'is_public' => false],
            ['group' => 'integrations', 'key' => 'mailerlite_api_key',    'label' => 'MailerLite API Key',    'type' => 'encrypted', 'value' => null, 'description' => 'MailerLite API key for newsletter synchronisation.',      'is_public' => false],
            ['group' => 'integrations', 'key' => 'mailerlite_group_id',   'label' => 'MailerLite Group ID',   'type' => 'string',    'value' => null, 'description' => 'Default MailerLite subscriber group / audience ID.',      'is_public' => false],
        ];

        $now = now();

        foreach ($settings as $setting) {
            DB::table('settings')->insertOrIgnore([
                'group' => $setting['group'],
                'key' => $setting['key'],
                'label' => $setting['label'],
                'type' => $setting['type'],
                'value' => $setting['value'] !== null ? json_encode($setting['value']) : null,
                'description' => $setting['description'],
                'is_public' => $setting['is_public'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        $groups = ['general', 'mail', 'seo', 'social', 'ecommerce', 'cookie', 'integrations'];

        DB::table('settings')->whereIn('group', $groups)->delete();
    }
};
