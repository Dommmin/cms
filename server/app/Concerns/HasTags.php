<?php

declare(strict_types=1);

namespace App\Concerns;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Support\Str;

trait HasTags
{
    public static function bootHasTags(): void
    {
        static::deleting(function (self $model): void {
            $model->tags()->detach();
        });
    }

    /** @return MorphToMany<Tag, $this> */
    public function tags(): MorphToMany
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    /**
     * Sync tags by name — creates missing tags, detaches removed ones.
     *
     * @param  array<int, string>  $tagNames
     */
    public function syncTags(array $tagNames): void
    {
        $tagIds = collect($tagNames)
            ->filter()
            ->map(fn (string $name) => Tag::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name],
            ))
            ->pluck('id')
            ->all();

        $this->tags()->sync($tagIds);
    }

    /**
     * Attach a single tag by name without detaching others.
     */
    public function attachTag(string $name): void
    {
        $tag = Tag::firstOrCreate(
            ['slug' => Str::slug($name)],
            ['name' => $name],
        );
        $this->tags()->syncWithoutDetaching([$tag->id]);
    }

    /**
     * Detach a single tag by name.
     */
    public function detachTag(string $name): void
    {
        $tag = Tag::query()->where('slug', Str::slug($name))->first();
        if ($tag) {
            $this->tags()->detach($tag->id);
        }
    }

    /**
     * Check if the model has a specific tag.
     */
    public function hasTag(string $name): bool
    {
        return $this->tags->contains('slug', Str::slug($name));
    }

    /**
     * Get all tag names as a plain array.
     *
     * @return array<int, string>
     */
    public function getTagNames(): array
    {
        return $this->tags->pluck('name')->all();
    }
}
