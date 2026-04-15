<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'description',
    'type',
    'configuration',
    'relations_config',
    'is_active',
])]
class ReusableBlock extends Model
{
    use HasFactory;

    public function pageBlocks(): HasMany
    {
        return $this->hasMany(PageBlock::class);
    }

    /**
     * Sync this global block's configuration to all linked PageBlocks.
     */
    public function syncToPageBlocks(): void
    {
        $this->pageBlocks()->update([
            'configuration' => $this->configuration,
        ]);
    }

    protected function casts(): array
    {
        return [
            'configuration' => 'array',
            'relations_config' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
