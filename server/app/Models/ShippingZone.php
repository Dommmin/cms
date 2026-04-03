<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ShippingZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'base_rate',
        'per_kg_rate',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'base_rate' => 'integer',
        'per_kg_rate' => 'integer',
    ];

    public function countries(): HasMany
    {
        return $this->hasMany(ShippingZoneCountry::class);
    }

    public function calculateShippingCost(float $weightKg, int $orderValue): int
    {
        return $this->base_rate + (int) ($this->per_kg_rate * $weightKg);
    }
}
