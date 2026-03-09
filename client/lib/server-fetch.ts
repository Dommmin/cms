/**
 * Server-side fetch utility for Next.js Server Components.
 *
 * Uses API_URL (Docker internal, e.g. http://nginx/api/v1) when running
 * server-side, falling back to NEXT_PUBLIC_API_URL or the default local URL.
 *
 * Never import this file in Client Components ("use client").
 */

const BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function serverFetch<T>(path: string, options?: { locale?: string }): Promise<T> {
  const locale = options?.locale;
  const separator = path.includes("?") ? "&" : "?";
  const url = `${BASE_URL}${path}${locale ? `${separator}locale=${locale}` : ""}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    // Opt out of Next.js data cache for CMS pages so fresh data is served.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${path}`);
  }

  return res.json() as Promise<T>;
}
