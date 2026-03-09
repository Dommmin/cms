"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { PaginatedResponse, Product } from "@/types/api";

const STORAGE_KEY = "recently_viewed";
const MAX_ITEMS = 10;

export function addRecentlyViewed(product: Pick<Product, "id">): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids: number[] = raw ? (JSON.parse(raw) as number[]) : [];
    const filtered = ids.filter((id) => id !== product.id);
    filtered.unshift(product.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {
    // ignore
  }
}

function getRecentlyViewedIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewedProducts(excludeId?: number) {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const all = getRecentlyViewedIds();
    setIds(excludeId ? all.filter((id) => id !== excludeId) : all);
  }, [excludeId]);

  return useQuery({
    queryKey: ["recently-viewed", ids.join(",")],
    queryFn: async (): Promise<Product[]> => {
      if (ids.length === 0) return [];
      const params = ids.reduce<Record<string, number>>((acc, id, i) => {
        acc[`ids[${i}]`] = id;
        return acc;
      }, {});
      const { data } = await api.get<PaginatedResponse<Product>>("/products", { params });
      // Preserve recently viewed order
      const map = new Map(data.data.map((p) => [p.id, p]));
      return ids.map((id) => map.get(id)).filter(Boolean) as Product[];
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
