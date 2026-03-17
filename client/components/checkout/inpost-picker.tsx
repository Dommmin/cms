"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface InPostPoint {
  name: string;
  address: {
    line1: string;
    line2: string;
  };
}

interface InpostPickerProps {
  value: string | null;
  onChange: (pointId: string, point: InPostPoint) => void;
  language?: string;
}

// Inner component — only rendered when the token is present (hooks are always called).
function InpostWidget({
  value,
  onChange,
  language,
  token,
}: InpostPickerProps & { token: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<Element | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Listen for pick events forwarded by the geowidget via custom DOM events.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = (e: Event) => {
      const point = (e as CustomEvent<InPostPoint & { name: string }>).detail;
      if (point?.name) {
        onChangeRef.current(point.name, point);
      }
    };

    container.addEventListener("inpost.point.select", handler);
    return () => container.removeEventListener("inpost.point.select", handler);
  }, []);

  // Create the widget element imperatively — avoids React setting `token` as a
  // DOM property, which fails because the custom element defines it as getter-only.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (widgetRef.current && container.contains(widgetRef.current)) {
      container.removeChild(widgetRef.current);
    }

    const el = document.createElement("inpost-geowidget");
    el.setAttribute("token", token);
    el.setAttribute("language", language ?? "pl");
    el.setAttribute("config", "parcelcollect");
    el.setAttribute("onpoint", "inpost.point.select");
    el.style.display = "block";
    el.style.height = "480px";
    el.style.width = "100%";

    container.appendChild(el);
    widgetRef.current = el;

    return () => {
      if (container.contains(el)) container.removeChild(el);
      widgetRef.current = null;
    };
  }, [language, token]);

  return (
    <div className="mt-3 space-y-2">
      {value && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
          <span className="font-medium text-primary">Wybrany paczkomat:</span>
          <span className="font-mono font-semibold">{value}</span>
          <button
            type="button"
            onClick={() => onChangeRef.current("", { name: "", address: { line1: "", line2: "" } })}
            className="ml-auto text-xs text-muted-foreground underline hover:text-foreground"
          >
            Zmień
          </button>
        </div>
      )}

      <Script src="https://geowidget.inpost.pl/inpost-geowidget.js" strategy="lazyOnload" />
      <div ref={containerRef} className="overflow-hidden rounded-xl border border-border" />
    </div>
  );
}

// Outer component — guards against missing NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN.
export function InpostPicker({ value, onChange, language = "pl" }: InpostPickerProps) {
  const token = process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN ?? "";

  if (!token) {
    return (
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950">
        <p className="font-medium text-amber-800 dark:text-amber-200">
          InPost Paczkomat picker unavailable — missing token
        </p>
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
          Set the following variable in{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">client/.env.local</code>:
        </p>
        <p className="mt-1.5 font-mono text-xs text-amber-900 dark:text-amber-100">
          NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN=
        </p>
      </div>
    );
  }

  return <InpostWidget value={value} onChange={onChange} language={language} token={token} />;
}
