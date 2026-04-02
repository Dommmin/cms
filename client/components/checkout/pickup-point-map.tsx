'use client';

import type { PickupPoint } from '@/types/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { PickupPointMapProps } from './pickup-point-map.types';

// ── Custom SVG pin icon ──────────────────────────────────────────────────────

function createPin(color: string) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="38">
    <path fill="${color}" stroke="white" stroke-width="1.5"
      d="M12 0C7.6 0 4 3.6 4 8c0 6 8 16 8 16S20 14 20 8c0-4.4-3.6-8-8-8z"/>
    <circle fill="white" cx="12" cy="8" r="3"/>
  </svg>`;
    return L.divIcon({
        html: svg,
        iconSize: [28, 38],
        iconAnchor: [14, 38],
        popupAnchor: [0, -40],
        className: '',
    });
}

const pinDefault = createPin('#2563eb');
const pinHovered = createPin('#dc2626');

// ── Auto-fit bounds when points change ──────────────────────────────────────

function FitBounds({ points }: { points: PickupPoint[] }) {
    const map = useMap();
    useEffect(() => {
        if (points.length === 0) return;
        const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }, [points, map]);
    return null;
}

// ── Main map component ───────────────────────────────────────────────────────

export function PickupPointMap({
    points,
    hoveredId,
    onSelect,
    onHover,
}: PickupPointMapProps) {
    const center: [number, number] =
        points.length > 0 ? [points[0].lat, points[0].lng] : [52.069, 19.48]; // Polska

    return (
        <MapContainer
            center={center}
            zoom={points.length > 0 ? 13 : 6}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <FitBounds points={points} />

            {points.map((point) => (
                <Marker
                    key={point.id}
                    position={[point.lat, point.lng]}
                    icon={hoveredId === point.id ? pinHovered : pinDefault}
                    eventHandlers={{
                        click: () => onSelect(point),
                        mouseover: () => onHover(point.id),
                        mouseout: () => onHover(null),
                    }}
                >
                    <Popup>
                        <div className="text-sm">
                            <p className="font-semibold">{point.name}</p>
                            <p className="text-muted-foreground">
                                {point.address}
                            </p>
                            {point.hours && (
                                <p className="text-muted-foreground mt-1 text-xs">
                                    {point.hours}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={() => onSelect(point)}
                                className="bg-primary text-primary-foreground mt-2 rounded px-3 py-1 text-xs font-medium"
                            >
                                Wybierz
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
