"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getProducts } from "@/api/products";

const STORAGE_KEY = "recent_searches";
const MAX_RECENT = 5;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  const existing = getRecentSearches().filter((q) => q !== trimmed);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([trimmed, ...existing].slice(0, MAX_RECENT)));
}

export function clearRecentSearches(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function useSearchSuggestions(query: string) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  return useQuery({
    queryKey: ["search-suggestions", debounced],
    queryFn: () => getProducts({ search: debounced, per_page: 5 }),
    enabled: debounced.trim().length >= 2,
    staleTime: 30_000,
  });
}
