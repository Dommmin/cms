<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\NewsletterSubscribeRequest;
use App\Models\NewsletterSubscriber;
use App\Notifications\NewsletterConfirmationNotification;
use App\Notifications\NewsletterWelcomeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class NewsletterController extends Controller
{
    public function subscribe(NewsletterSubscribeRequest $request): JsonResponse
    {
        $data = $request->validated();

        $subscriber = NewsletterSubscriber::query()->updateOrCreate(
            ['email' => $data['email']],
            [
                'first_name' => $data['first_name'] ?? null,
                'token' => Str::uuid()->toString(),
                'is_active' => false,
                'consent_given' => false,
                'unsubscribed_at' => null,
            ]
        );

        Notification::route('mail', $subscriber->email)
            ->notify(new NewsletterConfirmationNotification($subscriber));

        return response()->json([
            'message' => 'Please check your email to confirm your subscription.',
        ], 201);
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
            ->notify(new NewsletterWelcomeNotification($subscriber));

        return response()->json([
            'message' => 'Your subscription has been confirmed. Welcome!',
        ]);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $subscriber = NewsletterSubscriber::query()->where('email', $request->email)->first();

        if ($subscriber) {
            $subscriber->unsubscribe();
        }

        return response()->json(['message' => 'Successfully unsubscribed from the newsletter']);
    }

    public function unsubscribeByToken(string $token): JsonResponse
    {
        $subscriber = NewsletterSubscriber::query()->where('token', $token)->first();

        if ($subscriber) {
            $subscriber->unsubscribe();
        }

        return response()->json(['message' => 'Successfully unsubscribed from the newsletter']);
    }
}
