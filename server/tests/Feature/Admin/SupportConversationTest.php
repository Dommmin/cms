<?php

declare(strict_types=1);

use App\Enums\SupportConversationStatusEnum;
use App\Models\SupportCannedResponse;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
    $this->actingAs($this->user);
});

// ── Index ──────────────────────────────────────────────────────────────────────

it('displays support conversations index', function () {
    SupportConversation::factory()->count(3)->create();

    $this->get('/admin/support')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/support/index')
            ->has('conversations.data', 3)
        );
});

it('filters conversations by status', function () {
    SupportConversation::factory()->create(['status' => SupportConversationStatusEnum::OPEN]);
    SupportConversation::factory()->create(['status' => SupportConversationStatusEnum::CLOSED]);

    $this->get('/admin/support?status=open')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/support/index')
            ->has('conversations.data', 1)
        );
});

it('searches conversations by subject', function () {
    SupportConversation::factory()->create(['subject' => 'Pytanie o zamówienie 123']);
    SupportConversation::factory()->create(['subject' => 'Problem z produktem']);

    $this->get('/admin/support?search=zamówienie')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/support/index')
            ->has('conversations.data', 1)
        );
});

// ── Show ──────────────────────────────────────────────────────────────────────

it('displays support conversation detail', function () {
    $conversation = SupportConversation::factory()->create();
    SupportMessage::factory()->create(['conversation_id' => $conversation->id]);

    $this->get("/admin/support/{$conversation->id}")
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/support/show')
            ->where('conversation.id', $conversation->id)
        );
});

// ── Reply ─────────────────────────────────────────────────────────────────────

it('admin can reply to a conversation', function () {
    $conversation = SupportConversation::factory()->create([
        'status' => SupportConversationStatusEnum::OPEN,
    ]);

    $this->post("/admin/support/{$conversation->id}/reply", [
        'body' => 'Dzień dobry, pomogę Pani/Panu',
        'is_internal' => false,
    ])->assertRedirect();

    $this->assertDatabaseHas('support_messages', [
        'conversation_id' => $conversation->id,
        'body' => 'Dzień dobry, pomogę Pani/Panu',
        'sender_type' => 'agent',
        'is_internal' => false,
    ]);
});

it('admin reply sets conversation status to pending', function () {
    $conversation = SupportConversation::factory()->create([
        'status' => SupportConversationStatusEnum::OPEN,
    ]);

    $this->post("/admin/support/{$conversation->id}/reply", [
        'body' => 'Odpowiedź agenta',
        'is_internal' => false,
    ])->assertRedirect();

    expect($conversation->fresh()->status)->toBe(SupportConversationStatusEnum::PENDING);
});

it('admin can create an internal note', function () {
    $conversation = SupportConversation::factory()->create();

    $this->post("/admin/support/{$conversation->id}/reply", [
        'body' => 'Notatka wewnętrzna',
        'is_internal' => true,
    ])->assertRedirect();

    $this->assertDatabaseHas('support_messages', [
        'conversation_id' => $conversation->id,
        'body' => 'Notatka wewnętrzna',
        'sender_type' => 'agent',
        'is_internal' => true,
    ]);
});

it('internal note does not change conversation status', function () {
    $conversation = SupportConversation::factory()->create([
        'status' => SupportConversationStatusEnum::OPEN,
    ]);

    $this->post("/admin/support/{$conversation->id}/reply", [
        'body' => 'Notatka wewnętrzna',
        'is_internal' => true,
    ])->assertRedirect();

    expect($conversation->fresh()->status)->toBe(SupportConversationStatusEnum::OPEN);
});

// ── Status ────────────────────────────────────────────────────────────────────

it('admin can change conversation status', function () {
    $conversation = SupportConversation::factory()->create([
        'status' => SupportConversationStatusEnum::OPEN,
    ]);

    $this->post("/admin/support/{$conversation->id}/status", [
        'status' => 'resolved',
    ])->assertRedirect();

    expect($conversation->fresh()->status)->toBe(SupportConversationStatusEnum::RESOLVED);
});

// ── Assign ────────────────────────────────────────────────────────────────────

it('admin can assign a conversation to a user', function () {
    $conversation = SupportConversation::factory()->create(['assigned_to' => null]);
    $agent = User::factory()->create();

    $this->post("/admin/support/{$conversation->id}/assign", [
        'assigned_to' => $agent->id,
    ])->assertRedirect();

    expect($conversation->fresh()->assigned_to)->toBe($agent->id);
});

// ── Delete ────────────────────────────────────────────────────────────────────

it('admin can delete a conversation', function () {
    $conversation = SupportConversation::factory()->create();

    $this->delete("/admin/support/{$conversation->id}")
        ->assertRedirect('/admin/support');

    $this->assertDatabaseMissing('support_conversations', ['id' => $conversation->id]);
});

// ── Canned Responses ──────────────────────────────────────────────────────────

it('displays canned responses index', function () {
    SupportCannedResponse::factory()->count(2)->create();

    $this->get('/admin/support/canned-responses')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/support/canned-responses/index')
            ->has('canned_responses.data', 2)
        );
});

it('stores a new canned response', function () {
    $this->post('/admin/support/canned-responses', [
        'title' => 'Powitanie',
        'shortcut' => 'hello',
        'body' => 'Dzień dobry, w czym mogę pomóc?',
    ])->assertRedirect('/admin/support/canned-responses');

    $this->assertDatabaseHas('support_canned_responses', [
        'shortcut' => 'hello',
        'title' => 'Powitanie',
    ]);
});

it('shortcut must be unique', function () {
    SupportCannedResponse::factory()->create(['shortcut' => 'hello']);

    $this->post('/admin/support/canned-responses', [
        'title' => 'Duplicate',
        'shortcut' => 'hello',
        'body' => 'Body',
    ])->assertSessionHasErrors('shortcut');
});

it('updates a canned response', function () {
    $response = SupportCannedResponse::factory()->create([
        'title' => 'Old Title',
        'shortcut' => 'old',
        'body' => 'Old body',
    ]);

    $this->put("/admin/support/canned-responses/{$response->id}", [
        'title' => 'New Title',
        'shortcut' => 'new',
        'body' => 'New body',
    ])->assertRedirect('/admin/support/canned-responses');

    $this->assertDatabaseHas('support_canned_responses', [
        'id' => $response->id,
        'title' => 'New Title',
        'shortcut' => 'new',
    ]);
});

it('deletes a canned response', function () {
    $response = SupportCannedResponse::factory()->create();

    $this->delete("/admin/support/canned-responses/{$response->id}")
        ->assertRedirect('/admin/support/canned-responses');

    $this->assertDatabaseMissing('support_canned_responses', ['id' => $response->id]);
});
