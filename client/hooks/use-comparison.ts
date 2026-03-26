"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import type { Product } from "@/types/api";

const STORAGE_KEY = "compare_ids";
const MAX_COMPARE = 4;

function getIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function saveIds(ids: number[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("comparison-change"));
}

export function useComparisonIds() {
  const [ids, setIds] = useState<number[]>(() => getIds());

  useEffect(() => {
    const handler = () => setIds(getIds());
    window.addEventListener("comparison-change", handler);
    return () => window.removeEventListener("comparison-change", handler);
  }, []);

  return ids;
}

export function addToCompare(id: number): void {
  const ids = getIds();
  if (ids.includes(id) || ids.length >= MAX_COMPARE) return;
  saveIds([...ids, id]);
}

export function removeFromCompare(id: number): void {
  saveIds(getIds().filter((i) => i !== id));
}

export function clearComparison(): void {
  saveIds([]);
}

export function isInComparison(id: number): boolean {
  return getIds().includes(id);
}

export function useIsInComparison(id: number) {
  const ids = useComparisonIds();
  return ids.includes(id);
}

export function useComparisonProducts() {
  const ids = useComparisonIds();

  return useQuery({
    queryKey: ["comparison", ids.join(",")],
    queryFn: async (): Promise<Product[]> => {
      if (ids.length === 0) return [];
      const params = ids.reduce<Record<string, number>>((acc, id, i) => {
        acc[`ids[${i}]`] = id;
        return acc;
      }, {});
      const { data } = await api.get<{ data: Product[] }>("/products/compare", { params });
      return data.data;
    },
    enabled: ids.length >= 2,
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useToggleComparison(id: number) {
  const inComparison = useIsInComparison(id);

  return useCallback(() => {
    if (inComparison) {
      removeFromCompare(id);
    } else {
      addToCompare(id);
    }
  }, [id, inComparison]);
}
