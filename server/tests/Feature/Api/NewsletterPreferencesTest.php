<?php

declare(strict_types=1);

use App\Models\NewsletterSegment;
use App\Models\NewsletterSubscriber;
use Illuminate\Support\Str;

describe('Newsletter preferences API', function (): void {
    beforeEach(function (): void {
        $this->subscriber = NewsletterSubscriber::query()->create([
            'email' => 'subscriber@example.com',
            'first_name' => 'John',
            'locale' => 'en',
            'token' => Str::uuid()->toString(),
            'is_active' => true,
            'consent_given' => true,
        ]);

        $this->segment1 = NewsletterSegment::query()->create([
            'name' => 'Promo Segment',
            'description' => 'Promotional emails',
            'is_active' => true,
        ]);

        $this->segment2 = NewsletterSegment::query()->create([
            'name' => 'News Segment',
            'description' => 'Weekly news',
            'is_active' => true,
        ]);

        $this->segmentInactive = NewsletterSegment::query()->create([
            'name' => 'Inactive Segment',
            'description' => 'Should not be returned',
            'is_active' => false,
        ]);
    });

    it('can retrieve newsletter preferences by valid token', function (): void {
        $this->subscriber->segments()->attach($this->segment1->id);

        $response = $this->getJson(route('api.v1.newsletter.preferences.get', $this->subscriber->token))
            ->assertOk()
            ->assertJsonStructure([
                'email',
                'first_name',
                'is_active',
                'active_segments',
                'available_segments',
            ]);

        expect($response->json('email'))->toBe('subscriber@example.com');
        expect($response->json('first_name'))->toBe('John');
        expect($response->json('is_active'))->toBe(true);
        expect($response->json('active_segments'))->toBe([$this->segment1->id]);

        // Assert only active segments are returned
        $availableSegmentIds = collect($response->json('available_segments'))->pluck('id')->all();
        expect($availableSegmentIds)->toContain($this->segment1->id, $this->segment2->id);
        expect($availableSegmentIds)->not->toContain($this->segmentInactive->id);
    });

    it('returns 404 for retrieval with an invalid token', function (): void {
        $this->getJson(route('api.v1.newsletter.preferences.get', 'invalid-token-uuid'))
            ->assertNotFound();
    });

    it('can update newsletter preferences and segments by token', function (): void {
        $this->subscriber->segments()->attach($this->segment1->id);

        $this->postJson(route('api.v1.newsletter.preferences.update', $this->subscriber->token), [
            'first_name' => 'John updated',
            'is_active' => true,
            'segments' => [$this->segment2->id],
        ])->assertOk();

        $this->subscriber->refresh();
        expect($this->subscriber->first_name)->toBe('John updated');
        expect($this->subscriber->is_active)->toBe(true);
        expect($this->subscriber->unsubscribed_at)->toBeNull();
        expect($this->subscriber->segments->pluck('id')->all())->toBe([$this->segment2->id]);
    });

    it('records unsubscribed_at when is_active is set to false', function (): void {
        $this->postJson(route('api.v1.newsletter.preferences.update', $this->subscriber->token), [
            'first_name' => 'John',
            'is_active' => false,
            'segments' => [],
        ])->assertOk();

        $this->subscriber->refresh();
        expect($this->subscriber->is_active)->toBe(false);
        expect($this->subscriber->unsubscribed_at)->not->toBeNull();
    });

    it('validates segment IDs when updating preferences', function (): void {
        $this->postJson(route('api.v1.newsletter.preferences.update', $this->subscriber->token), [
            'first_name' => 'John',
            'is_active' => true,
            'segments' => [99999], // non-existent ID
        ])->assertUnprocessable();
    });
});
