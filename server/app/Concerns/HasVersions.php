<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\ModelVersion;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Auth;

/**
 * Polymorphic versioning trait.
 *
 * Add to any Eloquent model to get automatic version snapshots on save/delete.
 *
 * Usage in model:
 *   use HasVersions;
 *   protected array $versionedAttributes = ['name', 'slug', 'is_active'];
 *   protected int $maxVersions = 50;
 */
trait HasVersions
{
    public static function bootHasVersions(): void
    {
        static::saved(function (self $model): void {
            if (! $model->wasChanged() && ! $model->wasRecentlyCreated) {
                return;
            }

            $event = $model->wasRecentlyCreated ? 'created' : 'updated';
            $model->createVersion($event);
        });

        static::deleted(function (self $model): void {
            $model->createVersion('deleted');
        });
    }

    public function versions(): MorphMany
    {
        return $this->morphMany(ModelVersion::class, 'versionable')
            ->orderByDesc('version_number');
    }

    public function latestVersion(): ?ModelVersion
    {
        return $this->versions()->first();
    }

    public function createVersion(string $event = 'updated', ?string $changeNote = null): ModelVersion
    {
        $snapshot = $this->buildSnapshot();
        $previous = $this->versions()->first();
        $changes = $previous
            ? ModelVersion::diff($previous->snapshot ?? [], $snapshot)
            : [];

        $versionNumber = ($this->versions()->max('version_number') ?? 0) + 1;

        $version = $this->versions()->create([
            'version_number' => $versionNumber,
            'snapshot' => $snapshot,
            'changes' => $changes ?: null,
            'event' => $event,
            'created_by' => Auth::id(),
            'change_note' => $changeNote,
            'created_at' => now(),
        ]);

        $this->pruneOldVersions();

        return $version;
    }

    public function restoreVersion(ModelVersion $version): void
    {
        $snapshot = $version->snapshot ?? [];
        $fields = $this->getVersionedAttributes();

        $this->fill(array_intersect_key($snapshot, array_flip($fields)));
        $this->save();

        // Mark the restored version with a new entry
        $this->createVersion('restored', 'Restored from version '.$version->version_number);
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildSnapshot(): array
    {
        $attributes = $this->getVersionedAttributes();

        if (empty($attributes)) {
            return $this->toArray();
        }

        return array_intersect_key($this->toArray(), array_flip($attributes));
    }

    /**
     * @return array<int, string>
     */
    protected function getVersionedAttributes(): array
    {
        return property_exists($this, 'versionedAttributes')
            ? $this->versionedAttributes  // @phpstan-ignore-line
            : [];
    }

    protected function getMaxVersions(): int
    {
        return property_exists($this, 'maxVersions')
            ? $this->maxVersions  // @phpstan-ignore-line
            : 50;
    }

    protected function pruneOldVersions(): void
    {
        $max = $this->getMaxVersions();
        $count = $this->versions()->count();

        if ($count > $max) {
            $this->versions()
                ->orderBy('version_number')
                ->limit($count - $max)
                ->get()
                ->each->delete();
        }
    }
}
