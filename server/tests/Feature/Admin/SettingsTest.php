<?php

declare(strict_types=1);

use App\Models\Setting;
use App\Models\User;
use App\Queries\Admin\SettingsIndexQuery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
});

it('masks encrypted settings on the admin settings index', function (): void {
    Setting::set('payments', 'stripe_secret_key', 'sk_test_original_secret');
    Setting::set('payments', 'stripe_webhook_secret', 'whsec_test_original_secret');

    $query = new SettingsIndexQuery(Request::create('/panel/settings', 'GET', [
        'group' => 'payments',
    ]));

    $page = $query->execute();
    $stripeSecret = $page->getCollection()->firstWhere('key', 'stripe_secret_key');
    $stripeWebhookSecret = $page->getCollection()->firstWhere('key', 'stripe_webhook_secret');

    expect($stripeSecret?->value)->toBe('••••••••')
        ->and($stripeWebhookSecret?->value)->toBe('••••••••');
});

it('preserves encrypted settings when the placeholder value is submitted', function (): void {
    Setting::set('payments', 'stripe_secret_key', 'sk_test_original_secret');

    $this->actingAs($this->user)
        ->put(route('admin.settings.update'), [
            'settings' => [
                'stripe_secret_key' => '••••••••',
            ],
        ])
        ->assertRedirect();

    expect(Setting::get('payments', 'stripe_secret_key'))->toBe('sk_test_original_secret');
});
