<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AddressTypeEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $customer_id
 * @property AddressTypeEnum $type
 * @property string $first_name
 * @property string $last_name
 * @property string|null $company_name
 * @property string $street
 * @property string|null $street2
 * @property string $city
 * @property string $postal_code
 * @property string $country_code
 * @property string $phone
 * @property bool $is_default
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Customer|null $customer
 * @method static \Database\Factories\AddressFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereCountryCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address wherePostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereStreet($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereStreet2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Address whereUpdatedAt($value)
 * @mixin \Eloquent
 */
#[Fillable([
    'customer_id', 'type', 'first_name', 'last_name', 'company_name',
    'street', 'street2', 'city', 'postal_code', 'country_code', 'phone', 'is_default',
])]
#[Table(name: 'addresses')]
class Address extends Model
{
    use HasFactory;

    protected $casts = [
        'type' => AddressTypeEnum::class,
        'is_default' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function fullAddress(): string
    {
        $parts = [
            $this->street,
            $this->street2,
            $this->postal_code.' '.$this->city,
            $this->country_code,
        ];

        return implode(', ', array_filter($parts));
    }
}
