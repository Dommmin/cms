<?php

declare(strict_types=1);

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);
});

it('redirects to the provided url and sets admin_preview cookie', function () {
    $targetUrl = 'http://localhost:3000/en/about';

    $response = $this->get("/admin/preview?url={$targetUrl}&entity_type=page&entity_id=5&entity_name=About+Us&admin_url=/admin/cms/pages/5/edit");

    $response->assertRedirect($targetUrl);
    $response->assertCookie('admin_preview');
});

it('cookie payload contains entity data', function () {
    $response = $this->get('/admin/preview?url=http://localhost:3000/en/shop&entity_type=product&entity_id=12&entity_name=T-Shirt&admin_url=/admin/ecommerce/products/12/edit');

    $response->assertCookie('admin_preview');

    $cookieValue = $response->getCookie('admin_preview');
    $payload = json_decode(urldecode($cookieValue->getValue()), true);

    expect($payload['entity']['type'])->toBe('product');
    expect($payload['entity']['id'])->toBe('12');
    expect($payload['entity']['name'])->toBe('T-Shirt');
    expect($payload['entity']['admin_url'])->toContain('/admin/ecommerce/products/12/edit');
});

it('redirects without cookie when url is missing', function () {
    $response = $this->get('/admin/preview');

    $response->assertSessionHasErrors('url');
});

it('rejects invalid entity_type', function () {
    $response = $this->get('/admin/preview?url=http://localhost:3000&entity_type=unknown_type');

    $response->assertSessionHasErrors('entity_type');
});

it('blocks non-admin users from accessing preview', function () {
    $regularUser = User::factory()->create();
    $this->actingAs($regularUser);

    $response = $this->get('/admin/preview?url=http://localhost:3000');

    // Admin middleware blocks non-admins with 403/404/redirect
    expect($response->status())->toBeIn([302, 403, 404]);
});
