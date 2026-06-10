<?php

declare(strict_types=1);

use App\Enums\MenuLocationEnum;
use App\Enums\PageBlockTypeEnum;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\PageBlock;
use App\Models\Setting;
use App\Models\ShippingMethod;
use App\Models\TaxRate;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function (): void {
    Role::query()->firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
});

it('renders onboarding wizard index page', function (): void {
    $this->actingAs($this->user)
        ->get(route('admin.onboarding.index'))
        ->assertOk();
});

it('saves brand step settings and updates progress', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.onboarding.save-step', 'brand'), [
            'site_name' => 'My New Shop Name',
            'contact_email' => 'contact@example.com',
            'contact_phone' => '123456789',
        ])
        ->assertRedirect();

    expect(Setting::get('general', 'site_name'))->toBe('My New Shop Name')
        ->and(Setting::get('general', 'contact_email'))->toBe('contact@example.com')
        ->and(Setting::get('general', 'contact_phone'))->toBe('123456789');

    $completed = Setting::get('wizard', 'completed_steps');
    if (is_string($completed)) {
        $completed = json_decode($completed, true) ?: [];
    }

    expect($completed)->toContain('brand');
    expect(Setting::get('wizard', 'current_step'))->toBe('domain');
});

it('saves domain step settings', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.onboarding.save-step', 'domain'), [
            'site_url' => 'https://brandnewshop.test',
            'maintenance_mode' => true,
        ])
        ->assertRedirect();

    expect(Setting::get('general', 'site_url'))->toBe('https://brandnewshop.test')
        ->and(filter_var(Setting::get('general', 'maintenance_mode'), FILTER_VALIDATE_BOOLEAN))->toBeTrue();
});

it('saves seo step settings', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.onboarding.save-step', 'seo'), [
            'meta_title' => 'My Meta Title',
            'meta_description' => 'A nice storefront description.',
            'disable_indexing' => false,
        ])
        ->assertRedirect();

    expect(Setting::get('seo', 'meta_title'))->toBe('My Meta Title')
        ->and(Setting::get('seo', 'meta_description'))->toBe('A nice storefront description.')
        ->and(filter_var(Setting::get('seo', 'disable_indexing'), FILTER_VALIDATE_BOOLEAN))->toBeFalse();
});

it('saves payments step settings', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.onboarding.save-step', 'payments'), [
            'stripe_public_key' => 'pk_test_stripe_key',
            'stripe_secret_key' => 'sk_test_stripe_key',
            'payu_client_id' => '123456',
            'payu_client_secret' => 'payu_secret',
            'payu_pos_id' => '987654',
            'payu_md5_key' => 'payu_md5',
            'payu_sandbox' => true,
            'p24_merchant_id' => '111111',
            'p24_pos_id' => '222222',
            'p24_crc' => 'p24_crc_key',
            'p24_api_key' => 'p24_api_key',
            'p24_sandbox' => true,
            'bank_transfer_account_name' => 'John Doe Shop',
            'bank_transfer_iban' => 'PL12345678901234567890123456',
            'bank_transfer_swift' => 'SWIFT123',
            'bank_transfer_bank_name' => 'Awesome Bank',
        ])
        ->assertRedirect();

    expect(Setting::get('integrations', 'stripe_public_key'))->toBe('pk_test_stripe_key')
        ->and(Setting::get('integrations', 'stripe_secret_key'))->toBe('sk_test_stripe_key')
        ->and(Setting::get('payments', 'payu_client_id'))->toBe('123456')
        ->and(Setting::get('payments', 'payu_client_secret'))->toBe('payu_secret')
        ->and(Setting::get('payments', 'bank_transfer_iban'))->toBe('PL12345678901234567890123456');
});

it('saves shipping step settings', function (): void {
    $method = ShippingMethod::factory()->create([
        'name' => 'Courier',
        'is_active' => false,
        'base_price' => 1500,
    ]);

    $this->actingAs($this->user)
        ->post(route('admin.onboarding.save-step', 'shipping'), [
            'free_shipping_threshold' => 150,
            'shipping_cost' => 15,
            'methods' => [
                [
                    'id' => $method->id,
                    'is_active' => true,
                    'base_price' => 20.00,
                    'free_shipping_threshold' => 200.00,
                ],
            ],
        ])
        ->assertRedirect();

    expect(Setting::get('ecommerce', 'free_shipping_threshold'))->toBe(150)
        ->and(Setting::get('ecommerce', 'shipping_cost'))->toBe(15);

    $method->refresh();
    expect($method->is_active)->toBeTrue();
    expect($method->base_price)->toBe(2000);
    expect($method->free_shipping_threshold)->toBe(20000);
});

it('saves taxes step settings', function (): void {
    $rate = TaxRate::query()->create([
        'name' => 'VAT 23%',
        'rate' => 23,
        'country_code' => 'PL',
        'is_active' => true,
        'is_default' => true,
    ]);

    $this->actingAs($this->user)
        ->post(route('admin.onboarding.save-step', 'taxes'), [
            'tax_rate' => 23,
            'rates' => [
                [
                    'id' => $rate->id,
                    'name' => 'VAT 23% Updated',
                    'rate' => 23,
                    'country_code' => 'PL',
                    'is_active' => true,
                    'is_default' => true,
                ],
            ],
        ])
        ->assertRedirect();

    expect(Setting::get('ecommerce', 'tax_rate'))->toBe(23);

    $rate->refresh();
    expect($rate->name)->toBe('VAT 23% Updated');
});

it('saves homepage step settings', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.onboarding.save-step', 'homepage'), [
            'title' => 'Welcome to our shop',
            'subtitle' => 'The best curation online',
            'cta_text' => 'Shop New Arrivals',
            'cta_url' => '/new-arrivals',
        ])
        ->assertRedirect();

    $homePage = Page::query()->where('slug->en', 'home')->first();
    expect($homePage)->not->toBeNull();

    $heroBlock = PageBlock::query()
        ->where('page_id', $homePage->id)
        ->where('type', PageBlockTypeEnum::HeroBanner)
        ->first();

    expect($heroBlock)->not->toBeNull();
    expect($heroBlock->configuration['title'])->toBe('Welcome to our shop')
        ->and($heroBlock->configuration['subtitle'])->toBe('The best curation online');
});

it('saves menu step settings', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.onboarding.save-step', 'menu'), [
            'items' => [
                [
                    'label' => ['en' => 'Home', 'pl' => 'Strona Główna'],
                    'url' => '/',
                    'target' => '_self',
                    'icon' => 'home',
                    'children' => [
                        [
                            'label' => ['en' => 'Subpage', 'pl' => 'Podstrona'],
                            'url' => '/subpage',
                            'target' => '_self',
                            'icon' => 'file',
                        ],
                    ],
                ],
            ],
        ])
        ->assertRedirect();

    $menu = Menu::query()->where('location', MenuLocationEnum::Header->value)->first();
    expect($menu)->not->toBeNull();
    expect($menu->items()->count())->toBe(1);
    expect(MenuItem::query()->where('menu_id', $menu->id)->count())->toBe(2);
});

it('saves legal step settings', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.onboarding.save-step', 'legal'), [
            'privacy_policy_content' => '<p>Privacy Policy: Our rules...</p>',
            'terms_of_service_content' => '<p>Terms of Service: Use agreement...</p>',
        ])
        ->assertRedirect();

    $privacyPage = Page::query()->where('system_page_key', 'privacy_policy')->first();
    expect($privacyPage)->not->toBeNull();
    expect($privacyPage->content)->toContain('Privacy Policy', 'Our rules');

    $termsPage = Page::query()->where('system_page_key', 'terms_of_service')->first();
    expect($termsPage)->not->toBeNull();
    expect($termsPage->content)->toContain('Terms of Service', 'Use agreement');
});

it('finalizes onboarding wizard', function (): void {
    $this->actingAs($this->user)
        ->post(route('admin.onboarding.complete'))
        ->assertRedirect(route('admin.dashboard'));

    expect(filter_var(Setting::get('wizard', 'is_completed'), FILTER_VALIDATE_BOOLEAN))->toBeTrue();
    expect(Setting::get('wizard', 'current_step'))->toBe('completed');
});
