'use client';

import dynamic from 'next/dynamic';
import type { StoreMapProps } from './store-map.types';

const StoreMapInner = dynamic(() => import('./store-map-inner'), {
    ssr: false,
    loading: () => (
        <div
            className="bg-muted animate-pulse rounded-lg"
            style={{ height: 400 }}
        />
    ),
});

export function StoreMap({ stores, height = 400, zoom = 13 }: StoreMapProps) {
    return <StoreMapInner stores={stores} height={height} zoom={zoom} />;
}
