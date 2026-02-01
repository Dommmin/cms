<?php

declare(strict_types=1);

namespace App\Modules\Core\Domain\Models;

use App\Enums\AddressType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Address extends Model
{
    protected $table = 'addresses';

    protected $fillable = [
        'customer_id', 'type', 'first_name', 'last_name', 'company_name',
        'street', 'street2', 'city', 'postal_code', 'country_code', 'phone', 'is_default',
    ];

    protected $casts = [
        'type'       => AddressType::class,
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
            $this->postal_code . ' ' . $this->city,
            $this->country_code,
        ];

        return implode(', ', array_filter($parts));
    }
}

