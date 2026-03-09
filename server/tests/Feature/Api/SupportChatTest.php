<?php

declare(strict_types=1);

use App\Enums\SupportConversationStatusEnum;
use App\Models\Customer;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

test('guest can start a new support conversation', function () {
    $this->postJson('/api/v1/support/conversations', [
        'email' => 'jan@example.com',
        'name' => 'Jan Kowalski',
        'subject' => 'Pytanie o zamówienie',
        'body' => 'Kiedy dotrze moje zamówienie?',
        'channel' => 'widget',
    ])->assertStatus(201)
        ->assertJsonStructure([
            'id', 'token', 'subject', 'status', 'channel', 'email', 'name', 'messages',
        ])
        ->assertJsonPath('subject', 'Pytanie o zamówienie')
        ->assertJsonPath('status', 'open')
        ->assertJsonPath('channel', 'widget');

    expect(SupportConversation::query()->count())->toBe(1);
    expect(SupportMessage::query()->count())->toBe(1);
});

test('conversation token is uuid and unique', function () {
    $response = $this->postJson('/api/v1/support/conversations', [
        'email' => 'a@example.com',
        'name' => 'A',
        'subject' => 'Test',
        'body' => 'Hello',
    ])->assertStatus(201);

    $token = $response->json('token');

    expect($token)->toMatch('/^[0-9a-f-]{36}$/');
});

test('first message body is stored correctly', function () {
    $this->postJson('/api/v1/support/conversations', [
        'email' => 'jan@example.com',
        'name' => 'Jan',
        'subject' => 'Problem',
        'body' => 'Mam problem z produktem',
    ])->assertStatus(201);

    $this->assertDatabaseHas('support_messages', [
        'body' => 'Mam problem z produktem',
        'sender_type' => 'customer',
        'is_internal' => false,
    ]);
});

test('authenticated user conversation links to customer', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create(['user_id' => $user->id]);
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/support/conversations', [
        'subject' => 'Moje zamówienie',
        'body' => 'Proszę o pomoc',
    ])->assertStatus(201);

    $conversation = SupportConversation::query()->first();
    expect($conversation->customer_id)->toBe($customer->id);
});

test('authenticated user does not need email and name', function () {
    $user = User::factory()->create(['email' => 'user@example.com', 'name' => 'User Name']);
    Customer::factory()->create(['user_id' => $user->id]);
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/support/conversations', [
        'subject' => 'Test',
        'body' => 'Test message',
    ])->assertStatus(201);
});

test('guest must provide email and name', function () {
    $this->postJson('/api/v1/support/conversations', [
        'subject' => 'Test',
        'body' => 'Test message',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['email', 'name']);
});

test('body is required', function () {
    $this->postJson('/api/v1/support/conversations', [
        'email' => 'a@example.com',
        'name' => 'A',
        'subject' => 'Test',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['body']);
});

test('guest can fetch conversation by token', function () {
    $conversation = SupportConversation::factory()->create([
        'subject' => 'Mój problem',
        'status' => SupportConversationStatusEnum::OPEN,
    ]);

    SupportMessage::factory()->create([
        'conversation_id' => $conversation->id,
        'sender_type' => 'customer',
        'body' => 'Pierwsza wiadomość',
    ]);

    $this->getJson("/api/v1/support/conversations/{$conversation->token}")
        ->assertStatus(200)
        ->assertJsonPath('token', $conversation->token)
        ->assertJsonPath('subject', 'Mój problem')
        ->assertJsonCount(1, 'messages');
});

test('fetching conversation with wrong token returns 404', function () {
    $this->getJson('/api/v1/support/conversations/non-existent-token')
        ->assertStatus(404);
});

test('internal messages are not returned to customer', function () {
    $conversation = SupportConversation::factory()->create();

    SupportMessage::factory()->create([
        'conversation_id' => $conversation->id,
        'sender_type' => 'customer',
        'body' => 'Public message',
        'is_internal' => false,
    ]);

    SupportMessage::factory()->create([
        'conversation_id' => $conversation->id,
        'sender_type' => 'agent',
        'body' => 'Internal note',
        'is_internal' => true,
    ]);

    $response = $this->getJson("/api/v1/support/conversations/{$conversation->token}")
        ->assertStatus(200);

    $messages = $response->json('messages');
    expect(collect($messages)->where('is_internal', true)->count())->toBe(0);
    expect(collect($messages)->where('body', 'Public message')->count())->toBe(1);
});

test('customer can add a message to open conversation', function () {
    $conversation = SupportConversation::factory()->create([
        'status' => SupportConversationStatusEnum::PENDING,
    ]);

    $this->postJson("/api/v1/support/conversations/{$conversation->token}/messages", [
        'body' => 'Mam pytanie uzupełniające',
    ])->assertStatus(201)
        ->assertJsonPath('body', 'Mam pytanie uzupełniające')
        ->assertJsonPath('sender_type', 'customer');

    $this->assertDatabaseHas('support_messages', [
        'conversation_id' => $conversation->id,
        'body' => 'Mam pytanie uzupełniające',
        'sender_type' => 'customer',
    ]);
});

test('adding message updates conversation status to open', function () {
    $conversation = SupportConversation::factory()->create([
        'status' => SupportConversationStatusEnum::PENDING,
    ]);

    $this->postJson("/api/v1/support/conversations/{$conversation->token}/messages", [
        'body' => 'Jeszcze jedno pytanie',
    ])->assertStatus(201);

    expect($conversation->fresh()->status)->toBe(SupportConversationStatusEnum::OPEN);
});

test('customer cannot add message to closed conversation', function () {
    $conversation = SupportConversation::factory()->create([
        'status' => SupportConversationStatusEnum::CLOSED,
    ]);

    $this->postJson("/api/v1/support/conversations/{$conversation->token}/messages", [
        'body' => 'Próba',
    ])->assertStatus(404);
});

test('customer cannot add message to resolved conversation', function () {
    $conversation = SupportConversation::factory()->create([
        'status' => SupportConversationStatusEnum::RESOLVED,
    ]);

    $this->postJson("/api/v1/support/conversations/{$conversation->token}/messages", [
        'body' => 'Próba',
    ])->assertStatus(404);
});

test('adding message updates last_reply_at', function () {
    $conversation = SupportConversation::factory()->create([
        'last_reply_at' => null,
    ]);

    $this->postJson("/api/v1/support/conversations/{$conversation->token}/messages", [
        'body' => 'Nowa wiadomość',
    ])->assertStatus(201);

    expect($conversation->fresh()->last_reply_at)->not->toBeNull();
});
