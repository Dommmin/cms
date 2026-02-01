<?php

declare(strict_types=1);

namespace App\Modules\Ecommerce\Domain\Models;

use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Payment extends Model
{
    protected $table = 'payments';

    protected $fillable = [
        'order_id', 'provider', 'provider_transaction_id',
        'status', 'amount', 'currency_code', 'payload',
    ];

    protected $casts = [
        'provider' => PaymentProvider::class,
        'status'   => PaymentStatus::class,
        'payload'  => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function formattedAmount(): string
    {
        $currency = \App\Modules\Core\Domain\Models\Currency::where('code', $this->currency_code)->first() ?? \App\Modules\Core\Domain\Models\Currency::base();
        return $currency->format($this->amount);
    }
}

