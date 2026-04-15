<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'query',
    'results_count',
    'is_autocomplete',
    'locale',
    'ip',
])]
final class SearchLog extends Model
{
    use HasFactory;

    public function searcher(): MorphTo
    {
        return $this->morphTo();
    }

    protected function casts(): array
    {
        return [
            'is_autocomplete' => 'boolean',
            'results_count' => 'integer',
        ];
    }
}
