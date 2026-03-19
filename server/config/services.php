<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', '/auth/social/callback?provider=google'),
    ],

    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
        'redirect' => env('GITHUB_REDIRECT_URI', '/auth/social/callback?provider=github'),
    ],

    'payu' => [
        'client_id' => env('PAYU_CLIENT_ID'),
        'client_secret' => env('PAYU_CLIENT_SECRET'),
        'pos_id' => env('PAYU_POS_ID'),
        'md5_key' => env('PAYU_MD5_KEY'),
        'base_url' => env('PAYU_BASE_URL', 'https://sandbox.snd.payu.com'),
        'oauth_url' => env('PAYU_OAUTH_URL', 'https://secure.snd.payu.com'),
    ],

    'p24' => [
        'merchant_id' => env('P24_MERCHANT_ID'),
        'pos_id' => env('P24_POS_ID'),
        'crc' => env('P24_CRC'),
        'api_key' => env('P24_API_KEY'),
        'base_url' => env('P24_BASE_URL', 'https://sandbox.przelewy24.pl'),
    ],

    'apple_pay' => [
        'merchant_id' => env('APPLE_PAY_MERCHANT_ID'),
        'cert_path' => env('APPLE_PAY_CERT_PATH'),
        'key_path' => env('APPLE_PAY_KEY_PATH'),
    ],

    'furgonetka' => [
        'client_id' => env('FURGONETKA_CLIENT_ID'),
        'client_secret' => env('FURGONETKA_CLIENT_SECRET'),
        'base_url' => env('FURGONETKA_BASE_URL', 'https://api.furgonetka.pl'),
        'oauth_url' => env('FURGONETKA_OAUTH_URL', 'https://api.furgonetka.pl'),
        'sender_name' => env('FURGONETKA_SENDER_NAME'),
        'sender_email' => env('FURGONETKA_SENDER_EMAIL'),
        'sender_phone' => env('FURGONETKA_SENDER_PHONE'),
        'sender_street' => env('FURGONETKA_SENDER_STREET'),
        'sender_city' => env('FURGONETKA_SENDER_CITY'),
        'sender_postal_code' => env('FURGONETKA_SENDER_POSTAL_CODE'),
        'sender_country_code' => env('FURGONETKA_SENDER_COUNTRY_CODE', 'PL'),
    ],

    'inpost_shipx' => [
        'token' => env('INPOST_SHIPX_TOKEN'),
        'organization_id' => env('INPOST_SHIPX_ORGANIZATION_ID'),
        'base_url' => env('INPOST_SHIPX_BASE_URL', 'https://api-shipx-pl.easypack24.net/v1'),
        'geowidget_token' => env('INPOST_GEOWIDGET_TOKEN'),
    ],

    'bank_transfer' => [
        'account_name' => env('BANK_TRANSFER_ACCOUNT_NAME', ''),
        'iban' => env('BANK_TRANSFER_IBAN', ''),
        'swift' => env('BANK_TRANSFER_SWIFT', ''),
        'bank_name' => env('BANK_TRANSFER_BANK_NAME', ''),
    ],

];
