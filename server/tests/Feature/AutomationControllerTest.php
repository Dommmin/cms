<?php

declare(strict_types=1);

use App\Enums\CampaignStatusEnum;
use App\Enums\CampaignTriggerEnum;
use App\Enums\CampaignTypeEnum;
use App\Models\NewsletterCampaign;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\seed;

beforeEach(function (): void {
    seed([RolePermissionSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

describe('Marketing Automations admin', function (): void {
    it('lists only automated campaigns', function (): void {
        NewsletterCampaign::factory()->create([
            'type' => CampaignTypeEnum::Automated,
            'status' => CampaignStatusEnum::Ready,
            'trigger' => CampaignTriggerEnum::OnSubscribe,
        ]);

        NewsletterCampaign::factory()->create([
            'type' => CampaignTypeEnum::Broadcast,
            'status' => CampaignStatusEnum::Sent,
        ]);

        actingAs($this->admin)
            ->get(route('admin.marketing.automations.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/marketing/automations/index')
                ->has('campaigns', 1),
            );
    });

    it('includes trigger label and status label in the response', function (): void {
        NewsletterCampaign::factory()->create([
            'type' => CampaignTypeEnum::Automated,
            'status' => CampaignStatusEnum::Ready,
            'trigger' => CampaignTriggerEnum::OnFirstOrder,
        ]);

        actingAs($this->admin)
            ->get(route('admin.marketing.automations.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('campaigns.0', fn ($campaign) => $campaign
                    ->where('trigger', 'on_first_order')
                    ->where('trigger_label', CampaignTriggerEnum::OnFirstOrder->label())
                    ->where('status', 'ready')
                    ->where('status_label', CampaignStatusEnum::Ready->label())
                    ->etc(),
                ),
            );
    });

    it('returns empty list when no automated campaigns exist', function (): void {
        NewsletterCampaign::factory()->create([
            'type' => CampaignTypeEnum::Broadcast,
        ]);

        actingAs($this->admin)
            ->get(route('admin.marketing.automations.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('campaigns', 0),
            );
    });

    it('guest cannot access automation index', function (): void {
        $this->get(route('admin.marketing.automations.index'))
            ->assertNotFound();
    });

    it('shows create form with trigger list', function (): void {
        actingAs($this->admin)
            ->get(route('admin.marketing.automations.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/marketing/automations/create')
                ->has('triggers'),
            );
    });

    it('creates a new automation campaign', function (): void {
        actingAs($this->admin)
            ->post(route('admin.marketing.automations.store'), [
                'name' => 'Welcome Email',
                'trigger' => CampaignTriggerEnum::OnSubscribe->value,
                'subject' => 'Welcome to our store!',
                'content' => '<p>Hello, welcome!</p>',
                'status' => 'draft',
            ])
            ->assertRedirect(route('admin.marketing.automations.index'));

        $this->assertDatabaseHas('newsletter_campaigns', [
            'name' => 'Welcome Email',
            'type' => CampaignTypeEnum::Automated->value,
            'trigger' => CampaignTriggerEnum::OnSubscribe->value,
            'subject' => 'Welcome to our store!',
            'status' => CampaignStatusEnum::Draft->value,
        ]);
    });

    it('validates required fields on store', function (): void {
        actingAs($this->admin)
            ->post(route('admin.marketing.automations.store'), [])
            ->assertSessionHasErrors(['name', 'trigger', 'subject', 'content']);
    });

    it('validates trigger enum on store', function (): void {
        actingAs($this->admin)
            ->post(route('admin.marketing.automations.store'), [
                'name' => 'Test',
                'trigger' => 'invalid_trigger',
                'subject' => 'Test',
                'content' => 'Test',
            ])
            ->assertSessionHasErrors(['trigger']);
    });

    it('shows edit form with campaign data and triggers', function (): void {
        $campaign = NewsletterCampaign::factory()->create([
            'type' => CampaignTypeEnum::Automated,
            'trigger' => CampaignTriggerEnum::CartAbandonment,
        ]);

        actingAs($this->admin)
            ->get(route('admin.marketing.automations.edit', $campaign))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/marketing/automations/edit')
                ->has('triggers')
                ->has('automation', fn ($a) => $a
                    ->where('id', $campaign->id)
                    ->where('name', $campaign->name)
                    ->etc(),
                ),
            );
    });

    it('updates an automation campaign', function (): void {
        $campaign = NewsletterCampaign::factory()->create([
            'type' => CampaignTypeEnum::Automated,
            'trigger' => CampaignTriggerEnum::OnSubscribe,
            'status' => CampaignStatusEnum::Draft,
        ]);

        actingAs($this->admin)
            ->put(route('admin.marketing.automations.update', $campaign), [
                'name' => 'Updated Name',
                'trigger' => CampaignTriggerEnum::AfterPurchase->value,
                'subject' => 'Updated Subject',
                'content' => '<p>Updated content</p>',
                'status' => 'ready',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('newsletter_campaigns', [
            'id' => $campaign->id,
            'name' => 'Updated Name',
            'trigger' => CampaignTriggerEnum::AfterPurchase->value,
            'status' => CampaignStatusEnum::Ready->value,
        ]);
    });

    it('deletes an automation campaign', function (): void {
        $campaign = NewsletterCampaign::factory()->create([
            'type' => CampaignTypeEnum::Automated,
        ]);

        actingAs($this->admin)
            ->delete(route('admin.marketing.automations.destroy', $campaign))
            ->assertRedirect(route('admin.marketing.automations.index'));

        $this->assertDatabaseMissing('newsletter_campaigns', ['id' => $campaign->id]);
    });

    it('toggles status from draft to ready', function (): void {
        $campaign = NewsletterCampaign::factory()->create([
            'type' => CampaignTypeEnum::Automated,
            'status' => CampaignStatusEnum::Draft,
        ]);

        actingAs($this->admin)
            ->post(route('admin.marketing.automations.toggle', $campaign))
            ->assertRedirect();

        $this->assertDatabaseHas('newsletter_campaigns', [
            'id' => $campaign->id,
            'status' => CampaignStatusEnum::Ready->value,
        ]);
    });

    it('toggles status from ready to draft', function (): void {
        $campaign = NewsletterCampaign::factory()->create([
            'type' => CampaignTypeEnum::Automated,
            'status' => CampaignStatusEnum::Ready,
        ]);

        actingAs($this->admin)
            ->post(route('admin.marketing.automations.toggle', $campaign))
            ->assertRedirect();

        $this->assertDatabaseHas('newsletter_campaigns', [
            'id' => $campaign->id,
            'status' => CampaignStatusEnum::Draft->value,
        ]);
    });
});
