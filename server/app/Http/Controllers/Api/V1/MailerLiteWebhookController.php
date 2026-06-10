<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Models\NewsletterSubscriber;
use App\Services\Webhooks\IncomingWebhookHandler;
use App\Services\Webhooks\MailerLiteIncomingWebhookVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MailerLiteWebhookController extends ApiController
{
    /**
     * Handle incoming webhooks from MailerLite
     * e.g., subscriber.unsubscribed, subscriber.deleted
     */
    public function handle(
        Request $request,
        IncomingWebhookHandler $handler,
        MailerLiteIncomingWebhookVerifier $verifier,
    ): JsonResponse {
        return $handler->handle(
            $request,
            $verifier,
            function (array $payload): void {
                /** @var array<int, array<string, mixed>> $events */
                $events = $payload['events'] ?? [];

                foreach ($events as $event) {
                    $type = $event['type'] ?? null;
                    $email = $event['data']['subscriber']['email'] ?? null;
                    if (! is_string($email)) {
                        continue;
                    }

                    if ($email === '') {
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
            },
            [],
        );
    }
}
