<?php

declare(strict_types=1);

namespace App\Modules\Newsletter\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class NewsletterSegment extends Model
{
    protected $table = 'newsletter_segments';

    protected $fillable = [
        'name', 'description', 'rules', 'is_active',
    ];

    protected $casts = [
        'rules'     => 'array',
        'is_active' => 'boolean',
    ];

    public function campaigns(): HasMany
    {
        return $this->hasMany(NewsletterCampaign::class);
    }
}

