<?php

declare(strict_types=1);

namespace App\Enums;

enum CampaignTriggerEnum: string
{
    case OnSubscribe = 'on_subscribe';
    case OnFirstOrder = 'on_first_order';
    case OnBirthday = 'on_birthday';
    case AfterPurchase = 'after_purchase';
    case CartAbandonment = 'cart_abandonment';

    public function label(): string
    {
        return match ($this) {
            self::OnSubscribe => 'Przy signup',
            self::OnFirstOrder => 'Po pierwszym zakupie',
            self::OnBirthday => 'W dniu urodzin',
            self::AfterPurchase => 'Po zakupie (opóźnienie)',
            self::CartAbandonment => 'Porzucony koszyk',
        };
    }
}
