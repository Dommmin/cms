import { StoreMap } from '@/components/store-map';
import { getRelationsByKey } from '@/lib/format';
import type { Store } from '@/types/api';
import type { MapBlockConfig, MapBlockProps } from './map-block.types';

function resolveMapStores(
    cfg: MapBlockConfig,
    relations: MapBlockProps['block']['relations'],
): Store[] {
    const storeRelations = getRelationsByKey(relations, 'location');
    const resolvedStores = storeRelations
        .map((r) => r.data as Store | null)
        .filter((s): s is Store => s !== null);

    if (resolvedStores.length > 0) {
        return resolvedStores;
    }

    if (cfg.lat !== undefined && cfg.lng !== undefined) {
        return [
            {
                id: 0,
                name: cfg.title ?? 'Location',
                slug: '',
                address: '',
                city: '',
                country: '',
                phone: null,
                email: null,
                opening_hours: null,
                lat: cfg.lat,
                lng: cfg.lng,
            },
        ];
    }

    return [];
}

export function MapBlock({ block }: MapBlockProps) {
    const cfg = block.configuration as MapBlockConfig;
    const height = cfg.height ?? 400;
    const zoom = cfg.zoom ?? 14;
    const stores = resolveMapStores(cfg, block.relations);

    if (stores.length === 0) {
        return (
            <div
                className="border-border bg-muted text-muted-foreground flex items-center justify-center rounded-lg border border-dashed text-sm"
                style={{ height }}
            >
                No location configured.
            </div>
        );
    }

    return (
        <div>
            {cfg.title && (
                <h2 className="mb-4 text-2xl font-bold">{cfg.title}</h2>
            )}
            <div className="border-border overflow-hidden rounded-xl border">
                <StoreMap stores={stores} height={height} zoom={zoom} />
            </div>
        </div>
    );
}
