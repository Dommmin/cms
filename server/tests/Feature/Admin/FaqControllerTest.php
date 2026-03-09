<?php

declare(strict_types=1);

use App\Models\Faq;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);

    $this->user = User::factory()->create();
    $this->user->assignRole('admin');
    $this->actingAs($this->user);
});

it('displays faqs index page', function () {
    $faqs = Faq::factory()->count(3)->create();

    $response = $this->get('/admin/faqs');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/faqs/index')
            ->has('faqs.data', 3)
            ->has('categories')
        );
});

it('displays faq create page', function () {
    $response = $this->get('/admin/faqs/create');

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/faqs/create')
            ->has('categories')
        );
});

it('stores a new faq', function () {
    $data = [
        'question' => 'Test Question',
        'answer' => 'Test Answer',
        'category' => 'General',
        'is_active' => true,
        'position' => 1,
    ];

    $response = $this->post('/admin/faqs', $data);

    $response->assertRedirect('/admin/faqs')
        ->assertSessionHas('success', 'FAQ zostało utworzone');

    $this->assertDatabaseHas('faqs', [
        'question' => 'Test Question',
        'answer' => 'Test Answer',
        'category' => 'General',
    ]);
});

it('displays faq edit page', function () {
    $faq = Faq::factory()->create();

    $response = $this->get("/admin/faqs/{$faq->id}/edit");

    $response->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/faqs/edit')
            ->where('faq.id', $faq->id)
            ->has('categories')
        );
});

it('updates an existing faq', function () {
    $faq = Faq::factory()->create();

    $data = [
        'question' => 'Updated Question',
        'answer' => 'Updated Answer',
        'category' => 'Updated Category',
        'is_active' => false,
        'position' => 2,
    ];

    $response = $this->put("/admin/faqs/{$faq->id}", $data);

    $response->assertRedirect()->assertSessionHas('success', 'FAQ zostało zaktualizowane');

    $this->assertDatabaseHas('faqs', [
        'id' => $faq->id,
        'question' => 'Updated Question',
        'answer' => 'Updated Answer',
        'category' => 'Updated Category',
        'is_active' => false,
        'position' => 2,
    ]);
});

it('reorders faqs', function () {
    $faqs = Faq::factory()->count(3)->create();

    $data = [
        'items' => [
            ['id' => $faqs[2]->id, 'position' => 0],
            ['id' => $faqs[0]->id, 'position' => 1],
            ['id' => $faqs[1]->id, 'position' => 2],
        ],
    ];

    $response = $this->post('/admin/faqs/reorder', $data);

    $response->assertRedirect()->assertSessionHas('success', 'Kolejność została zaktualizowana');

    $this->assertDatabaseHas('faqs', ['id' => $faqs[2]->id, 'position' => 0]);
    $this->assertDatabaseHas('faqs', ['id' => $faqs[0]->id, 'position' => 1]);
    $this->assertDatabaseHas('faqs', ['id' => $faqs[1]->id, 'position' => 2]);
});

it('toggles faq active status', function () {
    $faq = Faq::factory()->create(['is_active' => true]);

    $response = $this->post("/admin/faqs/{$faq->id}/toggle-active");

    $response->assertRedirect()->assertSessionHas('success', 'FAQ zostało dezaktywowane');

    $this->assertDatabaseHas('faqs', [
        'id' => $faq->id,
        'is_active' => false,
    ]);
});

it('deletes a faq', function () {
    $faq = Faq::factory()->create();

    $response = $this->delete("/admin/faqs/{$faq->id}");

    $response->assertRedirect()->assertSessionHas('success', 'FAQ zostało usunięte');

    $this->assertDatabaseMissing('faqs', ['id' => $faq->id]);
});
