"use client";

/**
 * Dispatch this event from anywhere (e.g. footer) to open the cookie preferences panel.
 *
 * Usage:
 *   import { openCookiePreferences } from "@/providers/cookie-consent-provider";
 *   openCookiePreferences();
 */
export const COOKIE_CONSENT_OPEN_EVENT = "cookie-consent:open";

export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_OPEN_EVENT));
  }
}
