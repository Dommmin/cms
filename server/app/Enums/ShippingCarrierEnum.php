<?php

declare(strict_types=1);

namespace App\Enums;

enum ShippingCarrierEnum: string
{
    case INPOST = 'inpost';                   // InPost kurier (via Furgonetka)
    case INPOST_LOCKER = 'inpost_locker';     // InPost paczkomat (direct ShipX API)
    case DPD = 'dpd';                         // DPD kurier (via Furgonetka)
    case DPD_PICKUP = 'dpd_pickup';           // DPD Pickup Point (via Furgonetka)
    case DHL = 'dhl';                         // DHL kurier (via Furgonetka)
    case DHL_SERVICEPOINT = 'dhl_servicepoint'; // DHL ServicePoint (via Furgonetka)
    case GLS = 'gls';                         // GLS kurier (via Furgonetka)
    case PICKUP = 'pickup';                   // Odbiór osobisty — no-op

    public function getLabel(): string
    {
        return match ($this) {
            self::INPOST          => 'InPost Kurier',
            self::INPOST_LOCKER   => 'InPost Paczkomat',
            self::DPD             => 'DPD Kurier',
            self::DPD_PICKUP      => 'DPD Pickup',
            self::DHL             => 'DHL Parcel',
            self::DHL_SERVICEPOINT => 'DHL ServicePoint',
            self::GLS             => 'GLS Parcel',
            self::PICKUP          => 'Odbiór osobisty',
        };
    }

    /** Czy wymaga wyboru punktu odbioru? */
    public function requiresPickupPoint(): bool
    {
        return in_array($this, [self::INPOST_LOCKER, self::DPD_PICKUP, self::DHL_SERVICEPOINT], true);
    }

    /**
     * Czy punkt odbioru wybierany jest przez dedykowany geowidget (InPost)?
     * False = unified Leaflet picker z Furgonetka API.
     */
    public function usesNativeWidget(): bool
    {
        return $this === self::INPOST_LOCKER;
    }

    /**
     * Env variable names required for the checkout pickup-point picker.
     * Empty array = no external credentials needed at checkout time.
     *
     * @return string[]
     */
    public function checkoutEnvVars(): array
    {
        return match ($this) {
            self::INPOST_LOCKER      => ['INPOST_GEOWIDGET_TOKEN'],
            self::DPD_PICKUP,
            self::DHL_SERVICEPOINT   => ['FURGONETKA_CLIENT_ID', 'FURGONETKA_CLIENT_SECRET'],
            default                  => [],
        };
    }

    /** Kod usługi Furgonetka dla danego przewoźnika */
    public function furgonetkaServiceCode(): ?string
    {
        return match ($this) {
            self::INPOST          => 'inpost_kurier',
            self::DPD             => 'dpd_classic',
            self::DPD_PICKUP      => 'dpd_pickup',
            self::DHL             => 'dhl_parcel',
            self::DHL_SERVICEPOINT => 'dhl_servicepoint',
            self::GLS             => 'gls_business',
            default               => null,
        };
    }
}
