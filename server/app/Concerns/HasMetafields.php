<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\Metafield;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Collection;

trait HasMetafields
{
    /** @return MorphMany<Metafield, $this> */
    public function metafields(): MorphMany
    {
        return $this->morphMany(Metafield::class, 'owner');
    }

    public function metafield(string $namespace, string $key): ?Metafield
    {
        return $this->metafields()->where('namespace', $namespace)->where('key', $key)->first();
    }

    public function getMetafield(string $namespace, string $key, mixed $default = null): mixed
    {
        $mf = $this->metafield($namespace, $key);

        return $mf ? $mf->getCastedValue() : $default;
    }

    public function setMetafield(string $namespace, string $key, string $type, mixed $value): Metafield
    {
        $serialized = match ($type) {
            'json' => json_encode($value),
            'boolean' => $value ? 'true' : 'false',
            'date' => $value instanceof Carbon ? $value->toDateString() : $value,
            'datetime' => $value instanceof Carbon ? $value->toDateTimeString() : $value,
            default => (string) $value,
        };

        return $this->metafields()->updateOrCreate(
            ['namespace' => $namespace, 'key' => $key],
            ['type' => $type, 'value' => $serialized]
        );
    }

    public function deleteMetafield(string $namespace, string $key): void
    {
        $this->metafields()->where('namespace', $namespace)->where('key', $key)->delete();
    }

    /**
     * @param array<int, array{namespace: string, key: string, type?: string, value?: mixed, _delete?: bool}> $metafields
     */
    public function syncMetafields(array $metafields): void
    {
        foreach ($metafields as $mf) {
            if (isset($mf['_delete']) && $mf['_delete']) {
                $this->deleteMetafield($mf['namespace'], $mf['key']);
                continue;
            }

            $this->setMetafield($mf['namespace'], $mf['key'], $mf['type'], $mf['value'] ?? null);
        }
    }

    /** @return Collection<int, Metafield> */
    public function getMetafieldsByNamespace(string $namespace): Collection
    {
        return $this->metafields()->where('namespace', $namespace)->get();
    }
}
