<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use Carbon\CarbonImmutable;
use Database\Factories\PaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property PaymentProviderEnum $provider
 * @property string|null $payment_method
 * @property string|null $provider_transaction_id
 * @property PaymentStatusEnum $status
 * @property int $amount
 * @property string $currency_code
 * @property array<array-key, mixed>|null $payload
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Order $order
 *
 * @method static PaymentFactory factory($count = null, $state = [])
 * @method static Builder<static>|Payment newModelQuery()
 * @method static Builder<static>|Payment newQuery()
 * @method static Builder<static>|Payment query()
 * @method static Builder<static>|Payment whereAmount($value)
 * @method static Builder<static>|Payment whereCreatedAt($value)
 * @method static Builder<static>|Payment whereCurrencyCode($value)
 * @method static Builder<static>|Payment whereId($value)
 * @method static Builder<static>|Payment whereOrderId($value)
 * @method static Builder<static>|Payment wherePayload($value)
 * @method static Builder<static>|Payment wherePaymentMethod($value)
 * @method static Builder<static>|Payment whereProvider($value)
 * @method static Builder<static>|Payment whereProviderTransactionId($value)
 * @method static Builder<static>|Payment whereStatus($value)
 * @method static Builder<static>|Payment whereUpdatedAt($value)
 *
 * @mixin Model
 */
#[Fillable([
    'order_id', 'provider', 'payment_method', 'provider_transaction_id',
    'status', 'amount', 'currency_code', 'payload',
])]
#[Table(name: 'payments')]
class Payment extends Model
{
    use HasFactory;

    protected $casts = [
        'provider' => PaymentProviderEnum::class,
        'status' => PaymentStatusEnum::class,
        'payload' => 'array',
    ];

    /**
     * @return BelongsTo<Order, $this>
     */
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
