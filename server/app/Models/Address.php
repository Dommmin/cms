<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AddressTypeEnum;
use App\Models\Builders\AddressBuilder;
use Carbon\CarbonImmutable;
use Database\Factories\AddressFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Query\Builder;

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
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Customer|null $customer
 *
 * @method static AddressFactory factory($count = null, $state = [])
 * @method static AddressBuilder<static>|Address newModelQuery()
 * @method static AddressBuilder<static>|Address newQuery()
 * @method static AddressBuilder<static>|Address query()
 * @method static AddressBuilder<static>|Address findMatchingAddress(int $customerId, AddressTypeEnum $type, array $mapped)
 * @method static AddressBuilder<static>|Address whereCity($value)
 * @method static AddressBuilder<static>|Address whereCompanyName($value)
 * @method static AddressBuilder<static>|Address whereCountryCode($value)
 * @method static AddressBuilder<static>|Address whereCreatedAt($value)
 * @method static AddressBuilder<static>|Address whereCustomerId($value)
 * @method static AddressBuilder<static>|Address whereFirstName($value)
 * @method static AddressBuilder<static>|Address whereId($value)
 * @method static AddressBuilder<static>|Address whereIsDefault($value)
 * @method static AddressBuilder<static>|Address whereLastName($value)
 * @method static AddressBuilder<static>|Address wherePhone($value)
 * @method static AddressBuilder<static>|Address wherePostalCode($value)
 * @method static AddressBuilder<static>|Address whereStreet($value)
 * @method static AddressBuilder<static>|Address whereStreet2($value)
 * @method static AddressBuilder<static>|Address whereType($value)
 * @method static AddressBuilder<static>|Address whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'customer_id', 'type', 'first_name', 'last_name', 'company_name',
    'street', 'street2', 'city', 'postal_code', 'country_code', 'phone', 'is_default',
])]
#[Table(name: 'addresses')]
class Address extends Model
{
    use HasFactory;

    /**
     * Create a new Eloquent query builder for the model.
     *
     * @param  Builder  $query
     * @return AddressBuilder<static>
     */
    public function newEloquentBuilder($query): AddressBuilder
    {
        /** @var AddressBuilder<static> */
        $builder = new AddressBuilder($query);

        return $builder;
    }

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

    protected function casts(): array
    {
        return [
            'type' => AddressTypeEnum::class,
            'is_default' => 'boolean',
        ];
    }
}
