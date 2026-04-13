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
    case ProductReviewRequest = 'product_review_request';
    case WishlistBackInStock = 'wishlist_back_in_stock';
    case LoyaltyPointsEarned = 'loyalty_points_earned';
    case CategoryPurchased = 'category_purchased';
    case CustomerInactive = 'customer_inactive';
    case ProductPurchased = 'product_purchased';

    public function label(): string
    {
        return match ($this) {
            self::OnSubscribe => 'Przy signup',
            self::OnFirstOrder => 'Po pierwszym zakupie',
            self::OnBirthday => 'W dniu urodzin',
            self::AfterPurchase => 'Po zakupie (opóźnienie)',
            self::CartAbandonment => 'Porzucony koszyk',
            self::ProductReviewRequest => 'Prośba o recenzję produktu',
            self::WishlistBackInStock => 'Produkt z wishlist ponownie dostępny',
            self::LoyaltyPointsEarned => 'Punkty lojalnościowe zdobyte',
            self::CategoryPurchased => 'Zakup z kategorii',
            self::CustomerInactive => 'Nieaktywny klient',
            self::ProductPurchased => 'Zakup konkretnego produktu',
        };
    }
}
