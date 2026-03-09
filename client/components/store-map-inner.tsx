"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Store } from "@/types/api";

// Fix default marker icon paths for webpack/Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Props {
  stores: Store[];
  height?: number;
  zoom?: number;
}

function MapInvalidateSize() {
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);
  return null;
}

export default function StoreMapInner({ stores, height = 400, zoom = 13 }: Props) {
  const center: [number, number] =
    stores.length > 0
      ? [stores[0].lat, stores[0].lng]
      : [52.2297, 21.0122];

  const mapZoom = stores.length === 1 ? zoom : 6;

  return (
    <MapContainer
      center={center}
      zoom={mapZoom}
      style={{ height, width: "100%" }}
      scrollWheelZoom={false}
    >
      <MapInvalidateSize />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stores.map((store) => (
        <Marker key={store.id} position={[store.lat, store.lng]}>
          <Popup>
            <div className="min-w-[160px] space-y-1">
              <p className="font-semibold">{store.name}</p>
              <p className="text-sm text-gray-600">{store.address}</p>
              <p className="text-sm text-gray-600">
                {store.city}, {store.country}
              </p>
              {store.phone && (
                <p className="text-sm">
                  <a
                    href={`tel:${store.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {store.phone}
                  </a>
                </p>
              )}
              {store.opening_hours && (
                <div className="mt-1 text-xs text-gray-500">
                  {Object.entries(store.opening_hours).map(([day, hours]) => (
                    <div key={day}>
                      <span className="font-medium">{day}:</span> {hours}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
