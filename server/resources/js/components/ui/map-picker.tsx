import 'leaflet/dist/leaflet.css';
import type { Map, Marker } from 'leaflet';
import { useEffect, useRef } from 'react';

interface MapPickerProps {
    lat: number | null;
    lng: number | null;
    onChange: (lat: number, lng: number) => void;
}

export function MapPicker({ lat, lng, onChange }: MapPickerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);
    const markerRef = useRef<Marker | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !containerRef.current) return;

        import('leaflet').then((L) => {
            if (mapRef.current || !containerRef.current) return;

            // Fix default icon paths
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            const initialLat = lat ?? 52.0;
            const initialLng = lng ?? 19.0;
            const initialZoom = lat !== null ? 14 : 6;

            const map = L.map(containerRef.current!).setView(
                [initialLat, initialLng],
                initialZoom,
            );

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(map);

            if (lat !== null && lng !== null) {
                const marker = L.marker([lat, lng], { draggable: true }).addTo(
                    map,
                );
                marker.on('dragend', () => {
                    const pos = marker.getLatLng();
                    onChange(
                        Math.round(pos.lat * 1e7) / 1e7,
                        Math.round(pos.lng * 1e7) / 1e7,
                    );
                });
                markerRef.current = marker;
            }

            map.on('click', (e) => {
                const { lat: clickLat, lng: clickLng } = e.latlng;
                const roundedLat = Math.round(clickLat * 1e7) / 1e7;
                const roundedLng = Math.round(clickLng * 1e7) / 1e7;

                if (markerRef.current) {
                    markerRef.current.setLatLng([roundedLat, roundedLng]);
                } else {
                    const marker = L.marker([roundedLat, roundedLng], {
                        draggable: true,
                    }).addTo(map);
                    marker.on('dragend', () => {
                        const pos = marker.getLatLng();
                        onChange(
                            Math.round(pos.lat * 1e7) / 1e7,
                            Math.round(pos.lng * 1e7) / 1e7,
                        );
                    });
                    markerRef.current = marker;
                }

                onChange(roundedLat, roundedLng);
            });

            mapRef.current = map;
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update marker position when lat/lng change externally
    useEffect(() => {
        if (!mapRef.current || lat === null || lng === null) return;
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        }
    }, [lat, lng]);

    return (
        <div className="space-y-1">
            <div
                ref={containerRef}
                className="h-64 w-full rounded-md border"
                style={{ zIndex: 0 }}
            />
            <p className="text-muted-foreground text-xs">
                Click on the map to set location, or drag the marker to adjust.
            </p>
        </div>
    );
}
