'use client';

import { Loader2, MapPin, Search, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { usePickupPoints } from '@/hooks/use-pickup-points';
import type { PickupPoint } from '@/types/api';
import type { PickupPointPickerProps } from './pickup-point-picker.types';

// Leaflet cannot run on the server — dynamically imported with ssr:false
const PickupPointMap = dynamic(
  () => import('./pickup-point-map').then((m) => ({ default: m.PickupPointMap })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted flex h-full items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    ),
  },
);

export function PickupPointPicker({
  carrier,
  postalCode = '',
  value,
  onChange,
}: PickupPointPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(postalCode);
  const [selected, setSelected] = useState<PickupPoint | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sync postal code from billing address when it changes
  useEffect(() => {
    if (postalCode && !search) void Promise.resolve().then(() => setSearch(postalCode));
  }, [postalCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: points = [], configured, missingEnv, isLoading } = usePickupPoints(carrier, search);

  // Show a setup notice when API credentials are not configured in server/.env
  if (!configured) {
    return (
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950">
        <p className="font-medium text-amber-800 dark:text-amber-200">
          Pickup points unavailable — missing credentials
        </p>
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
          Set the following variables in{' '}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">server/.env</code>:
        </p>
        <ul className="mt-1.5 space-y-0.5">
          {missingEnv.map((v) => (
            <li key={v} className="font-mono text-xs text-amber-900 dark:text-amber-100">
              {v}=
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const handleSelect = (point: PickupPoint) => {
    setSelected(point);
    onChange(point.id, point);
    setOpen(false);
  };

  return (
    <div className="mt-3">
      {/* ── Selected point display ────────────────────────────────── */}
      {value && selected ? (
        <div className="border-primary/40 bg-primary/5 flex items-start gap-3 rounded-xl border px-3 py-3">
          <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{selected.name}</p>
            <p className="text-muted-foreground text-xs">{selected.address}</p>
            {selected.hours && (
              <p className="text-muted-foreground/70 mt-0.5 text-xs">{selected.hours}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-primary shrink-0 text-xs underline-offset-2 hover:underline"
          >
            Zmień
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border-border text-muted-foreground hover:border-primary/60 hover:text-primary flex w-full items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm transition-colors"
        >
          <MapPin className="h-4 w-4" />
          Wybierz punkt odbioru na mapie
        </button>
      )}

      {/* ── Modal ────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-background relative flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-3">
              <MapPin className="text-primary h-5 w-5" />
              <span className="font-semibold">Wybierz punkt odbioru</span>

              <div className="relative ml-auto">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  placeholder="Kod pocztowy, np. 30-001"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-input focus:border-primary h-8 w-52 rounded-lg border bg-transparent pr-3 pl-8 text-sm outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground ml-2 rounded-md p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body: list + map */}
            <div className="flex min-h-0 flex-1">
              {/* List */}
              <div className="border-border w-72 shrink-0 overflow-y-auto border-r">
                {isLoading ? (
                  <div className="space-y-2 p-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-muted h-16 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : points.length === 0 ? (
                  <div className="text-muted-foreground flex flex-col items-center gap-2 px-4 py-12 text-center text-sm">
                    <MapPin className="h-8 w-8 opacity-40" />
                    <p>
                      Wpisz kod pocztowy,
                      <br />
                      żeby zobaczyć najbliższe punkty.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-1 p-2">
                    {points.map((point) => (
                      <li key={point.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setHoveredId(point.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => handleSelect(point)}
                          className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                            hoveredId === point.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                          }`}
                        >
                          <p className="leading-tight font-semibold">{point.name}</p>
                          <p className="text-muted-foreground mt-0.5 text-xs">{point.address}</p>
                          {point.hours && (
                            <p className="text-muted-foreground/60 mt-0.5 text-xs">{point.hours}</p>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Map */}
              <div className="relative flex-1">
                <PickupPointMap
                  points={points}
                  hoveredId={hoveredId}
                  onSelect={handleSelect}
                  onHover={setHoveredId}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
