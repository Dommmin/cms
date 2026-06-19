<?php

declare(strict_types=1);

namespace App\Http\Middleware\Idempotency;

/**
 * Immutable snapshot of a replayable HTTP response, persisted under an
 * Idempotency-Key. Stored as a plain array (see {@see self::toArray()}) so the
 * cache payload stays forward-compatible if this class changes shape.
 */
final readonly class IdempotencyRecord
{
    /**
     * @param  array<string, list<string>>  $headers
     */
    public function __construct(
        public string $fingerprint,
        public string $body,
        public int $status,
        public array $headers,
        public string $createdAt,
    ) {}

    /**
     * Rebuild a record from a raw cache value, tolerating any corruption or
     * schema drift by returning null instead of throwing.
     */
    public static function fromCache(mixed $data): ?self
    {
        if (! is_array($data)) {
            return null;
        }

        $fingerprint = $data['fingerprint'] ?? null;
        $body = $data['body'] ?? null;
        $status = $data['status'] ?? null;
        $headers = $data['headers'] ?? null;
        $createdAt = $data['created_at'] ?? null;

        if (! is_string($fingerprint) || ! is_string($body) || ! is_int($status)
            || ! is_array($headers) || ! is_string($createdAt)) {
            return null;
        }

        return new self($fingerprint, $body, $status, $headers, $createdAt);
    }

    /**
     * @return array{fingerprint: string, body: string, status: int, headers: array<string, list<string>>, created_at: string}
     */
    public function toArray(): array
    {
        return [
            'fingerprint' => $this->fingerprint,
            'body' => $this->body,
            'status' => $this->status,
            'headers' => $this->headers,
            'created_at' => $this->createdAt,
        ];
    }
}
