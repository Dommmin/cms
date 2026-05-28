<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $address
 * @property string $city
 * @property string $country
 * @property string|null $phone
 * @property string|null $email
 * @property array<array-key, mixed>|null $opening_hours
 * @property numeric $lat
 * @property numeric $lng
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static Builder<static>|Store active()
 * @method static \Database\Factories\StoreFactory factory($count = null, $state = [])
 * @method static Builder<static>|Store newModelQuery()
 * @method static Builder<static>|Store newQuery()
 * @method static Builder<static>|Store query()
 * @method static Builder<static>|Store whereAddress($value)
 * @method static Builder<static>|Store whereCity($value)
 * @method static Builder<static>|Store whereCountry($value)
 * @method static Builder<static>|Store whereCreatedAt($value)
 * @method static Builder<static>|Store whereEmail($value)
 * @method static Builder<static>|Store whereId($value)
 * @method static Builder<static>|Store whereIsActive($value)
 * @method static Builder<static>|Store whereLat($value)
 * @method static Builder<static>|Store whereLng($value)
 * @method static Builder<static>|Store whereName($value)
 * @method static Builder<static>|Store whereOpeningHours($value)
 * @method static Builder<static>|Store wherePhone($value)
 * @method static Builder<static>|Store whereSlug($value)
 * @method static Builder<static>|Store whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'name',
    'slug',
    'address',
    'city',
    'country',
    'phone',
    'email',
    'opening_hours',
    'lat',
    'lng',
    'is_active',
])]
class Store extends Model
{
    use HasFactory;

    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    protected function casts(): array
    {
        return [
            'opening_hours' => 'array',
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
            'is_active' => 'boolean',
        ];
    }
}
