<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentProviderEnum: string
{
    case P24 = 'p24';
    case PAYU = 'payu';
    case STRIPE = 'stripe';
    case CASH_ON_DELIVERY = 'cash_on_delivery';
    case BANK_TRANSFER = 'bank_transfer';

    public function getLabel(): string
    {
        return match ($this) {
            self::P24 => 'Przelewy24',
            self::PAYU => 'PayU',
            self::STRIPE => 'Stripe',
            self::CASH_ON_DELIVERY => 'Płatność przy odbiorze',
            self::BANK_TRANSFER => 'Przelew bankowy',
        };
    }

    public function requiresRedirect(): bool
    {
        return match ($this) {
            self::P24, self::PAYU, self::STRIPE => true,
            self::CASH_ON_DELIVERY, self::BANK_TRANSFER => false,
        };
    }
}
