<?php

declare(strict_types=1);

use App\Models\Form;
use App\Models\FormField;
use App\Models\FormSubmission;
use App\Notifications\FormSubmissionNotification;
use Illuminate\Support\Facades\Notification;

function createContactForm(): Form
{
    $form = Form::query()->create([
        'name' => 'Contact Form',
        'slug' => 'contact',
        'is_active' => true,
        'allow_multiple' => true,
        'success_message' => 'Thank you for your message!',
    ]);

    FormField::query()->create([
        'form_id' => $form->id,
        'name' => 'name',
        'label' => 'Name',
        'type' => 'text',
        'position' => 1,
        'is_required' => true,
    ]);

    FormField::query()->create([
        'form_id' => $form->id,
        'name' => 'email',
        'label' => 'Email',
        'type' => 'email',
        'position' => 2,
        'is_required' => true,
    ]);

    FormField::query()->create([
        'form_id' => $form->id,
        'name' => 'message',
        'label' => 'Message',
        'type' => 'text',
        'position' => 3,
        'is_required' => false,
    ]);

    return $form;
}

test('user can submit a form and gets success message', function () {
    Notification::fake();

    $form = createContactForm();

    $this->postJson("/api/v1/forms/{$form->id}/submit", [
        'fields' => [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'message' => 'Hello world',
        ],
    ])->assertStatus(201)
        ->assertJsonFragment(['message' => 'Thank you for your message!']);

    expect(FormSubmission::query()->where('form_id', $form->id)->count())->toBe(1);
});

test('submission payload is stored correctly', function () {
    Notification::fake();

    $form = createContactForm();

    $this->postJson("/api/v1/forms/{$form->id}/submit", [
        'fields' => [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
        ],
    ])->assertStatus(201);

    $submission = FormSubmission::query()->where('form_id', $form->id)->first();
    expect($submission->payload['name'])->toBe('Jane Smith')
        ->and($submission->payload['email'])->toBe('jane@example.com');
});

test('required field validation fails when missing', function () {
    $form = createContactForm();

    $this->postJson("/api/v1/forms/{$form->id}/submit", [
        'fields' => [
            'message' => 'No name or email',
        ],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['fields.name', 'fields.email']);
});

test('form with allow_multiple false blocks second submission from same IP', function () {
    Notification::fake();

    $form = Form::query()->create([
        'name' => 'One-Time Form',
        'slug' => 'one-time',
        'is_active' => true,
        'allow_multiple' => false,
    ]);

    FormField::query()->create([
        'form_id' => $form->id,
        'name' => 'text',
        'label' => 'Text',
        'type' => 'text',
        'position' => 1,
        'is_required' => true,
    ]);

    $this->postJson("/api/v1/forms/{$form->id}/submit", [
        'fields' => ['text' => 'First submission'],
    ])->assertStatus(201);

    $this->postJson("/api/v1/forms/{$form->id}/submit", [
        'fields' => ['text' => 'Second submission'],
    ])->assertStatus(422)
        ->assertJsonFragment(['message' => 'You have already submitted this form.']);
});

test('notification email is sent when form has notification_email', function () {
    Notification::fake();

    $form = Form::query()->create([
        'name' => 'Notified Form',
        'slug' => 'notified',
        'is_active' => true,
        'allow_multiple' => true,
        'notification_email' => 'admin@store.com',
    ]);

    FormField::query()->create([
        'form_id' => $form->id,
        'name' => 'name',
        'label' => 'Name',
        'type' => 'text',
        'position' => 1,
        'is_required' => true,
    ]);

    $this->postJson("/api/v1/forms/{$form->id}/submit", [
        'fields' => ['name' => 'Test User'],
    ])->assertStatus(201);

    Notification::assertSentOnDemand(FormSubmissionNotification::class);
});

test('submitting inactive form returns 404', function () {
    $form = Form::query()->create([
        'name' => 'Inactive Form',
        'slug' => 'inactive',
        'is_active' => false,
    ]);

    $this->postJson("/api/v1/forms/{$form->id}/submit", [
        'fields' => [],
    ])->assertNotFound();
});

test('submitting non-existent form returns 404', function () {
    $this->postJson('/api/v1/forms/99999/submit', [
        'fields' => [],
    ])->assertNotFound();
});
