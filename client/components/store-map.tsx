"use client";

import dynamic from "next/dynamic";
import type { Store } from "@/types/api";

const StoreMapInner = dynamic(() => import("./store-map-inner"), {
  ssr: false,
  loading: () => (
    <div
      className="animate-pulse rounded-lg bg-muted"
      style={{ height: 400 }}
    />
  ),
});

interface Props {
  stores: Store[];
  height?: number;
  zoom?: number;
}

export function StoreMap({ stores, height = 400, zoom = 13 }: Props) {
  return <StoreMapInner stores={stores} height={height} zoom={zoom} />;
}
