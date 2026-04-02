'use client';

import { useCurrency } from '@/hooks/use-currency';
import { useTranslation } from '@/hooks/use-translation';
import type { PriceDisplayProps } from './price-display.types';

const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
};

export function PriceDisplay({
    price,
    compareAtPrice,
    omnibusPrice,
    isOnSale,
    size = 'lg',
    className,
}: PriceDisplayProps) {
    const { formatPrice } = useCurrency();
    const { t } = useTranslation();
    const onSale = isOnSale ?? (!!compareAtPrice && compareAtPrice > price);

    return (
        <div className={className}>
            <div className="flex items-baseline gap-2">
                <span className={`${sizeClasses[size]} font-semibold`}>
                    {formatPrice(price)}
                </span>
                {onSale && compareAtPrice && (
                    <span className="text-muted-foreground text-sm line-through">
                        {formatPrice(compareAtPrice)}
                    </span>
                )}
            </div>
            {onSale && omnibusPrice != null && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                    {t('product.omnibus_label', 'Lowest price in last 30 days')}
                    :{' '}
                    <span className="font-medium">
                        {formatPrice(omnibusPrice)}
                    </span>
                </p>
            )}
        </div>
    );
}
