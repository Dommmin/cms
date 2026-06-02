<?php

declare(strict_types=1);

use App\Infrastructure\Newsletter\KlaviyoProvider;
use App\Infrastructure\Newsletter\MailchimpProvider;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

test('mailchimp provider respects configuration check', function (): void {
    $provider = new MailchimpProvider('', '');
    expect($provider->isConfigured())->toBeFalse();

    $configured = new MailchimpProvider('key-us21', 'list-123');
    expect($configured->isConfigured())->toBeTrue();
});

test('mailchimp provider sends correct request to subscribe', function (): void {
    Http::fake();

    $provider = new MailchimpProvider('key-us21', 'list-123');
    $provider->subscribe('test@example.com', ['first_name' => 'John', 'last_name' => 'Doe']);

    Http::assertSent(fn (Request $request): bool => str_contains($request->url(), 'us21.api.mailchimp.com/3.0/lists/list-123/members')
        && $request->method() === 'PUT'
        && $request['email_address'] === 'test@example.com'
        && $request['status'] === 'subscribed'
        && $request['merge_fields']['FNAME'] === 'John'
        && $request['merge_fields']['LNAME'] === 'Doe');
});

test('klaviyo provider respects configuration check', function (): void {
    $provider = new KlaviyoProvider('', '');
    expect($provider->isConfigured())->toBeFalse();

    $configured = new KlaviyoProvider('klaviyo-key', 'list-123');
    expect($configured->isConfigured())->toBeTrue();
});

test('klaviyo provider sends correct request to subscribe', function (): void {
    Http::fake();

    $provider = new KlaviyoProvider('klaviyo-key', 'list-123');
    $provider->subscribe('test@example.com', ['first_name' => 'John', 'last_name' => 'Doe']);

    Http::assertSent(fn (Request $request): bool => $request->url() === 'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/'
        && $request->method() === 'POST'
        && $request->header('Authorization')[0] === 'Klaviyo-API-Key klaviyo-key'
        && $request['data']['type'] === 'profile-subscription-bulk-create-job'
        && $request['data']['relationships']['list']['data']['id'] === 'list-123'
        && $request['data']['attributes']['profiles']['data'][0]['attributes']['email'] === 'test@example.com');
});
