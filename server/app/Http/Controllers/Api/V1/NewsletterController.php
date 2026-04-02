<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\NewsletterSubscribeRequest;
use App\Http\Requests\Api\V1\NewsletterUnsubscribeRequest;
use App\Models\NewsletterSubscriber;
use App\Notifications\NewsletterConfirmationNotification;
use App\Notifications\NewsletterWelcomeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class NewsletterController extends ApiController
{
    public function subscribe(NewsletterSubscribeRequest $request): JsonResponse
    {
        $data = $request->validated();

        $subscriber = NewsletterSubscriber::query()->updateOrCreate(
            ['email' => $data['email']],
            [
                'first_name' => $data['first_name'] ?? null,
                'locale' => app()->getLocale(),
                'token' => Str::uuid()->toString(),
                'is_active' => false,
                'consent_given' => false,
                'unsubscribed_at' => null,
            ]
        );

        Notification::route('mail', $subscriber->email)
            ->notify((new NewsletterConfirmationNotification($subscriber))->locale($subscriber->locale));

        return $this->created([
            'message' => 'Please check your email to confirm your subscription.',
        ]);
    }

    public function confirmSubscription(string $token): JsonResponse
    {
        $subscriber = NewsletterSubscriber::query()->where('token', $token)->firstOrFail();

        $subscriber->update([
            'is_active' => true,
            'consent_given' => true,
            'consent_given_at' => now(),
        ]);

        Notification::route('mail', $subscriber->email)
            ->notify((new NewsletterWelcomeNotification($subscriber))->locale($subscriber->locale));

        return $this->ok([
            'message' => 'Your subscription has been confirmed. Welcome!',
        ]);
    }

    public function unsubscribe(NewsletterUnsubscribeRequest $request): JsonResponse
    {
        $subscriber = NewsletterSubscriber::query()->where('email', $request->email)->first();

        if ($subscriber) {
            $subscriber->unsubscribe();
        }

        return $this->ok(['message' => 'Successfully unsubscribed from the newsletter']);
    }

    public function unsubscribeByToken(string $token): JsonResponse
    {
        $subscriber = NewsletterSubscriber::query()->where('token', $token)->first();

        if ($subscriber) {
            $subscriber->unsubscribe();
        }

        return $this->ok(['message' => 'Successfully unsubscribed from the newsletter']);
    }
}
