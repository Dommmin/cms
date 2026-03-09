<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Modules\Core\Domain\Models\Currency;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments';

    protected $fillable = [
        'order_id', 'provider', 'provider_transaction_id',
        'status', 'amount', 'currency_code', 'payload',
    ];

    protected $casts = [
        'provider' => PaymentProviderEnum::class,
        'status' => PaymentStatusEnum::class,
        'payload' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function formattedAmount(): string
    {
        $currency = Currency::query()->where('code', $this->currency_code)->first() ?? Currency::base();

        return $currency->format($this->amount);
    }
}
