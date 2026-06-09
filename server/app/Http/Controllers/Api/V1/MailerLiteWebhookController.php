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
        $signature = $request->header('X-MailerLite-Signature');

        if (! $signature) {
            return response()->json(['message' => 'Signature missing.'], 401);
        }

        $secret = config('services.mailerlite.webhook_secret') ?: config('services.mailerlite.api_key');

        if (! $secret) {
            return response()->json(['message' => 'Verification secret not configured.'], 500);
        }

        $payload = $request->getContent();
        $expectedSignature = base64_encode(hash_hmac('sha256', $payload, (string) $secret, true));

        if (! hash_equals($expectedSignature, $signature)) {
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

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
