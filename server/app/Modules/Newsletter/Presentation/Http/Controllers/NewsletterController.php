<?php

declare(strict_types=1);

namespace App\Modules\Newsletter\Presentation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\NewsletterSubscribeRequest;
use App\Http\Requests\NewsletterUnsubscribeRequest;
use App\Modules\Newsletter\Domain\Models\NewsletterClick;
use App\Modules\Newsletter\Domain\Models\NewsletterOpen;
use App\Modules\Newsletter\Domain\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Newsletter Controller
 * Moved to Newsletter module
 */
final class NewsletterController extends Controller
{
    /** POST /api/newsletter/subscribe */
    public function subscribe(NewsletterSubscribeRequest $request): JsonResponse
    {
        NewsletterSubscriber::create([
            'email'            => $request->email,
            'first_name'       => $request->first_name,
            'tags'             => $request->tags,
            'consent_given'    => true,
            'consent_given_at' => now(),
            'consent_ip'       => $request->ip(),
            'consent_source'   => $request->consent_source,
            'is_active'        => true,
        ]);

        return response()->json(['message' => 'Thank you for subscribing!']);
    }

    /** POST /api/newsletter/unsubscribe */
    public function unsubscribe(NewsletterUnsubscribeRequest $request): JsonResponse
    {
        $subscriber = NewsletterSubscriber::where('token', $request->token)->firstOrFail();
        $subscriber->unsubscribe($request->reason);

        return response()->json(['message' => 'You have been unsubscribed.']);
    }

    /** GET /api/newsletter/track/open/{campaignId}/{token} — invisible pixel */
    public function trackOpen(string $campaignId, string $token): Response
    {
        $subscriber = NewsletterSubscriber::where('token', $token)->first();

        if ($subscriber) {
            NewsletterOpen::create([
                'newsletter_campaign_id'    => $campaignId,
                'newsletter_subscriber_id'  => $subscriber->id,
                'ip_address'                => request()->ip(),
                'user_agent'                => request()->userAgent(),
                'opened_at'                 => now(),
            ]);

            // Update campaign stats
            \App\Modules\Newsletter\Domain\Models\NewsletterCampaign::where('id', $campaignId)
                ->increment('total_opened');
        }

        // Return 1x1 transparent pixel
        $pixel = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');

        return response($pixel, 200, [
            'Content-Type'  => 'image/png',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }

    /** GET /api/newsletter/track/click/{trackingToken} */
    public function trackClick(string $trackingToken): \Illuminate\Http\RedirectResponse
    {
        $click = NewsletterClick::where('tracking_token', $trackingToken)->first();

        if ($click) {
            $click->update([
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'clicked_at' => now(),
            ]);

            \App\Modules\Newsletter\Domain\Models\NewsletterCampaign::where('id', $click->newsletter_campaign_id)
                ->increment('total_clicked');

            return redirect($click->url);
        }

        return redirect('/');
    }
}

