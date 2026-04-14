<?php

declare(strict_types=1);

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function __construct(
        private string $provider = '',
        private string $apiKey = '',
        private string $sender = ''
    ) {
        $this->provider = (string) config('services.sms.provider', 'smsapi');
        $this->apiKey = (string) config('services.sms.api_key', '');
        $this->sender = (string) config('services.sms.sender', 'CMS');
    }

    public function send(string $to, string $message): bool
    {
        if ($this->provider === 'smsapi') {
            if ($this->apiKey === '') {
                Log::warning('SMS API key is not configured');

                return false;
            }

            return $this->sendViaSmsApi($to, $message);
        }

        if ($this->provider === 'twilio') {
            return $this->sendViaTwilio($to, $message);
        }

        Log::error('SMS provider not configured');

        return false;
    }

    private function sendViaSmsApi(string $to, string $message): bool
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
            ])->post('https://api.smsapi.pl/sms.do', [
                'to' => $to,
                'message' => $message,
                'from' => $this->sender,
                'format' => 'json',
            ]);

            return $response->successful();
        } catch (Exception $exception) {
            Log::error('SMS API error: '.$exception->getMessage());

            return false;
        }
    }

    private function sendViaTwilio(string $to, string $message): bool
    {
        try {
            $accountSid = (string) config('services.twilio.account_sid', '');
            $authToken = (string) config('services.twilio.auth_token', '');

            if ($accountSid === '' || $authToken === '' || $this->sender === '') {
                Log::warning('Twilio credentials are not configured');

                return false;
            }

            $response = Http::withBasicAuth($accountSid, $authToken)
                ->post(sprintf('https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json', $accountSid), [
                    'To' => $to,
                    'From' => $this->sender,
                    'Body' => $message,
                ]);

            return $response->successful();
        } catch (Exception $exception) {
            Log::error('Twilio error: '.$exception->getMessage());

            return false;
        }
    }
}
