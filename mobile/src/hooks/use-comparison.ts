import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { getComparisonProducts } from '@/api/products';
import { getStoredItem, setStoredItem } from '@/lib/storage';

const STORAGE_KEY = 'compare_ids';
const MAX_COMPARE = 4;
const subscribers = new Set<(ids: number[]) => void>();

function parseIds(raw: string | null): number[] {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

async function readIds(): Promise<number[]> {
  return parseIds(await getStoredItem(STORAGE_KEY));
}

async function saveIds(ids: number[]): Promise<void> {
  await setStoredItem(STORAGE_KEY, JSON.stringify(ids));
  subscribers.forEach((subscriber) => subscriber(ids));
}

export function useComparisonIds() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    let mounted = true;
    void readIds().then((storedIds) => {
      if (mounted) setIds(storedIds);
    });
    subscribers.add(setIds);
    return () => {
      mounted = false;
      subscribers.delete(setIds);
    };
  }, []);

  return ids;
}

export function useComparison() {
  const ids = useComparisonIds();

  async function add(id: number): Promise<void> {
    const current = await readIds();
    if (current.includes(id) || current.length >= MAX_COMPARE) return;
    await saveIds([...current, id]);
  }

  async function remove(id: number): Promise<void> {
    await saveIds((await readIds()).filter((item) => item !== id));
  }

  async function clear(): Promise<void> {
    await saveIds([]);
  }

  return {
    ids,
    isFull: ids.length >= MAX_COMPARE,
    add,
    remove,
    clear,
    includes: (id: number) => ids.includes(id),
  };
}

export function useComparisonProducts() {
  const ids = useComparisonIds();

  return useQuery({
    queryKey: ['comparison', ids.join(',')],
    queryFn: () => getComparisonProducts(ids),
    enabled: ids.length >= 2,
  });
}
