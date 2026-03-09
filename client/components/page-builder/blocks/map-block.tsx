"use client";

import { useEffect, useState } from "react";

import { StoreMap } from "@/components/store-map";
import type { PageBlock, Store } from "@/types/api";

interface MapBlockConfig {
  store_id?: number;
  lat?: number;
  lng?: number;
  title?: string;
  zoom?: number;
  height?: number;
}

interface Props {
  block: PageBlock;
}

export function MapBlock({ block }: Props) {
  const cfg = block.configuration as MapBlockConfig;
  const height = cfg.height ?? 400;
  const zoom = cfg.zoom ?? 14;

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (cfg.store_id) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL ?? "/api/v1"}/stores/${cfg.store_id}`,
          );
          if (res.ok) {
            const json = await res.json();
            setStores([json.data]);
          }
        } catch {
          // fall through to coordinate fallback
        }
      }

      if (cfg.lat !== undefined && cfg.lng !== undefined) {
        setStores((prev) =>
          prev.length > 0
            ? prev
            : [
                {
                  id: 0,
                  name: cfg.title ?? "Location",
                  slug: "",
                  address: "",
                  city: "",
                  country: "",
                  phone: null,
                  email: null,
                  opening_hours: null,
                  lat: cfg.lat!,
                  lng: cfg.lng!,
                },
              ],
        );
      }

      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div
        className="animate-pulse rounded-lg bg-muted"
        style={{ height }}
      />
    );
  }

  if (stores.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted text-sm text-muted-foreground"
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
      <div className="overflow-hidden rounded-xl border border-border">
        <StoreMap stores={stores} height={height} zoom={zoom} />
      </div>
    </div>
  );
}
