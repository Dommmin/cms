<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NewsletterSegment extends Model
{
    use HasFactory;

    protected $table = 'newsletter_segments';

    protected $fillable = [
        'name', 'description', 'rules', 'is_active',
    ];

    protected $casts = [
        'rules' => 'array',
        'is_active' => 'boolean',
    ];

    public function campaigns(): HasMany
    {
        return $this->hasMany(NewsletterCampaign::class);
    }
}
