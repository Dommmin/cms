<?php

declare(strict_types=1);

namespace App\Enums;

enum NotificationTypeEnum: string
{
    case OrderCreated = 'order_created';
    case OrderPaid = 'order_paid';
    case OrderShipped = 'order_shipped';
    case OrderDelivered = 'order_delivered';
    case OrderCancelled = 'order_cancelled';
    case ReturnStatusUpdate = 'return_status_update';
    case ReviewApproved = 'review_approved';
    case PasswordReset = 'password_reset';
    case Welcome = 'welcome';
    case LowStockAlert = 'low_stock_alert';

    public function label(): string
    {
        return match ($this) {
            self::OrderCreated => 'Nowe zamówienie',
            self::OrderPaid => 'Zamówienie opłacone',
            self::OrderShipped => 'Zamówienie wysłane',
            self::OrderDelivered => 'Zamówienie dostarczono',
            self::OrderCancelled => 'Zamówienie anulowane',
            self::ReturnStatusUpdate => 'Aktualizacja zwrotu',
            self::ReviewApproved => 'Opinia zatwierdzona',
            self::PasswordReset => 'Reset hasła',
            self::Welcome => 'Witaj',
            self::LowStockAlert => 'Niski stock',
        };
    }
}
