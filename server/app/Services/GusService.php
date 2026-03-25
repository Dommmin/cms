<?php

declare(strict_types=1);

namespace App\Services;

use GusApi\Adapter\Soap\SoapAdapter;
use GusApi\Exception\InvalidUserKeyException;
use GusApi\Exception\NotFoundException;
use GusApi\GusApi;
use GusApi\RegonConstantsInterface;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class GusService
{
    /** @var array<string, mixed>|null */
    private ?array $cachedApiKey = null;

    /**
     * Look up a company by NIP number.
     *
     * @return array{name: string, regon: string, city: string, zip_code: string, street: string, type: string}
     *
     * @throws RuntimeException when GUS is unavailable or the NIP is not found
     */
    public function lookupByNip(string $nip): array
    {
        $nip = preg_replace('/\D/', '', $nip);

        if (! $this->isValidNip($nip)) {
            throw new RuntimeException('Invalid NIP number format.');
        }

        $apiKey = $this->resolveApiKey();
        $api    = $this->buildClient($apiKey);

        $sid = $api->login();

        try {
            $results = $api->getByNip($sid, $nip);
        } catch (NotFoundException) {
            throw new RuntimeException('No company found for the given NIP number.');
        } finally {
            $api->logout($sid);
        }

        $report = $results[0];

        return [
            'name'     => $report->getName(),
            'regon'    => $report->getRegon(),
            'city'     => $report->getCity(),
            'zip_code' => $report->getZipCode(),
            'street'   => $report->getStreet(),
            'type'     => $report->getType(),
        ];
    }

    /**
     * Check whether the GUS API is reachable and the configured key is valid.
     */
    public function ping(): bool
    {
        try {
            $api = $this->buildClient($this->resolveApiKey());

            return $api->serviceStatus() === 1;
        } catch (Throwable) {
            return false;
        }
    }

    private function resolveApiKey(): string
    {
        $row = DB::table('settings')
            ->where('group', 'integrations')
            ->where('key', 'gus_api_key')
            ->value('value');

        if (! $row) {
            throw new RuntimeException('GUS API key is not configured. Set it in Settings → Integrations.');
        }

        $encrypted = json_decode($row, true);

        try {
            $key = Crypt::decryptString($encrypted);
        } catch (Throwable) {
            throw new RuntimeException('GUS API key is stored but could not be decrypted.');
        }

        return $key;
    }

    private function buildClient(string $apiKey): GusApi
    {
        $sandbox = config('app.env') !== 'production';

        $adapter = new SoapAdapter(
            $sandbox ? RegonConstantsInterface::BASE_WSDL_URL_TEST : RegonConstantsInterface::BASE_WSDL_URL,
            $sandbox ? RegonConstantsInterface::BASE_WSDL_ADDRESS_TEST : RegonConstantsInterface::BASE_WSDL_ADDRESS,
        );

        return new GusApi($apiKey, $adapter);
    }

    /**
     * Validate NIP using the official checksum algorithm.
     */
    private function isValidNip(string $nip): bool
    {
        if (strlen($nip) !== 10) {
            return false;
        }

        $weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
        $sum     = 0;

        for ($i = 0; $i < 9; $i++) {
            $sum += (int) $nip[$i] * $weights[$i];
        }

        return ($sum % 11) === (int) $nip[9];
    }
}
