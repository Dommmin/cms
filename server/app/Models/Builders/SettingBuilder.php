<?php

declare(strict_types=1);

namespace App\Models\Builders;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * @template TModelClass of Setting
 *
 * @extends Builder<TModelClass>
 */
class SettingBuilder extends Builder
{
    /**
     * Find a setting by its group and key.
     */
    public function findByGroupAndKey(string $group, string $key): ?Setting
    {
        /** @var Setting|null */
        return $this->where('group', $group)->where('key', $key)->first();
    }

    /**
     * Get all public settings.
     *
     * @return Collection<int, Setting>
     */
    public function getPublicSettings(): Collection
    {
        return $this->where('is_public', true)->get();
    }
}
