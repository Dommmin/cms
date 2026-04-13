<?php

declare(strict_types=1);

use App\Models\EmailTemplate;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function (): void {
    app()->make(PermissionRegistrar::class)->forgetCachedPermissions();
    Role::query()->firstOrCreate(['name' => 'admin']);
    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
});

it('can list email templates', function (): void {
    EmailTemplate::factory()->count(3)->create();

    $response = $this->actingAs($this->user)
        ->get(route('admin.ecommerce.email-templates.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/email-templates/index')
        ->has('templates.data', 3)
    );
});

it('can view email template edit page', function (): void {
    $template = EmailTemplate::factory()->create();

    $response = $this->actingAs($this->user)
        ->get(route('admin.ecommerce.email-templates.edit', $template));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/email-templates/edit')
        ->has('template')
        ->where('template.id', $template->id)
    );
});

it('can update an email template', function (): void {
    $template = EmailTemplate::factory()->create([
        'subject' => 'Old Subject',
        'body' => '<p>Old body</p>',
        'is_active' => true,
    ]);

    $this->actingAs($this->user)
        ->patch(route('admin.ecommerce.email-templates.update', $template), [
            'subject' => 'New Subject',
            'body' => '<p>New body content</p>',
            'is_active' => '1',
        ]);

    $this->assertDatabaseHas('email_templates', [
        'id' => $template->id,
        'subject' => 'New Subject',
    ]);
});

it('validates required fields on update', function (): void {
    $template = EmailTemplate::factory()->create();

    $response = $this->actingAs($this->user)
        ->patch(route('admin.ecommerce.email-templates.update', $template), [
            'subject' => '',
            'body' => '',
        ]);

    $response->assertSessionHasErrors(['subject', 'body']);
});

it('can deactivate an email template', function (): void {
    $template = EmailTemplate::factory()->create(['is_active' => true]);

    $this->actingAs($this->user)
        ->patch(route('admin.ecommerce.email-templates.update', $template), [
            'subject' => $template->subject,
            'body' => $template->body,
            'is_active' => '0',
        ]);

    expect($template->fresh()->is_active)->toBeFalse();
});
