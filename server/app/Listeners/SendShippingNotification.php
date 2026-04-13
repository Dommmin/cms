<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\OrderShipped;
use App\Models\EmailTemplate;
use App\Services\SmsService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendShippingNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(private readonly SmsService $smsService) {}

    public function handle(OrderShipped $event): void
    {
        $order = $event->order->load(['customer.user', 'shipment']);

        $email = $order->customer?->user?->email ?? $order->guest_email;
        $phone = $order->customer?->phone ?? null;
        $reference = $order->reference_number;
        $tracking = $order->shipment?->tracking_number;

        $this->sendEmail($email, $reference, $tracking);

        if ($phone && $tracking) {
            $this->sendSms($phone, $reference, $tracking);
        }
    }

    private function sendEmail(?string $email, string $reference, ?string $tracking): void
    {
        if (! $email) {
            return;
        }

        try {
            /** @var EmailTemplate|null $template */
            $template = EmailTemplate::query()
                ->where('key', 'order.shipped')
                ->where('is_active', true)
                ->first();

            if (! $template) {
                return;
            }

            $subject = str_replace(['{{reference}}', '{{tracking}}'], [$reference, $tracking ?? ''], $template->subject);
            $body = str_replace(['{{reference}}', '{{tracking}}'], [$reference, $tracking ?? ''], $template->body);

            Mail::html($body, function ($message) use ($email, $subject): void {
                $message->to($email)->subject($subject);
            });
        } catch (Exception $exception) {
            Log::error('SendShippingNotification email failed', [
                'email' => $email,
                'reference' => $reference,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function sendSms(string $phone, string $reference, string $tracking): void
    {
        try {
            $message = sprintf(
                'Twoje zamówienie %s zostało wysłane. Numer śledzenia: %s',
                $reference,
                $tracking,
            );

            $this->smsService->send($phone, $message);
        } catch (Exception $exception) {
            Log::error('SendShippingNotification SMS failed', [
                'phone' => $phone,
                'reference' => $reference,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
