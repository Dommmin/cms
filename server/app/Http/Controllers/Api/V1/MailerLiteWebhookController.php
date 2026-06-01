<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MailerLiteWebhookController extends ApiController
{
    /**
     * Handle incoming webhooks from MailerLite
     * e.g., subscriber.unsubscribed, subscriber.deleted
     */
    public function handle(Request $request): JsonResponse
    {
        $events = $request->input('events', []);

        foreach ($events as $event) {
            $type = $event['type'] ?? null;
            $email = $event['data']['subscriber']['email'] ?? null;

            if (! $email) {
                continue;
            }

            $subscriber = NewsletterSubscriber::query()->where('email', $email)->first();

            if (! $subscriber) {
                continue;
            }

            match ($type) {
                'subscriber.unsubscribed' => $subscriber->unsubscribe('mailerlite_webhook'),
                'subscriber.deleted' => $subscriber->delete(),
                default => Log::debug('Unhandled MailerLite webhook type: '.$type),
            };
        }

        return $this->ok([]);
    }
}
