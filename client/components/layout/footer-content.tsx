"use client";

import Link from "next/link";

import { useTranslation } from "@/hooks/use-translation";
import { openCookiePreferences } from "@/providers/cookie-consent-provider";
import type { MenuItem } from "@/types/api";

import { NewsletterForm } from "./newsletter-form";
import type { FooterContentProps } from './footer-content.types';

export function FooterContent({ mainItems, legalItems, currentYear }: FooterContentProps) {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight text-primary">
              Store
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("footer.tagline", "Curated fashion, home décor and lifestyle essentials — crafted to last.")}
            </p>
          </div>

          {/* Main links */}
          {mainItems.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("footer.quick_links", "Quick Links")}
              </h3>
              <ul className="space-y-2">
                {mainItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url ?? "#"}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("footer.newsletter", "Newsletter")}
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("footer.newsletter_desc", "Get exclusive offers and style inspiration.")}
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Store. {t("footer.rights", "All rights reserved.")}
          </p>
          <nav className="flex flex-wrap gap-4">
            {legalItems.map((item) => (
              <Link
                key={item.id}
                href={item.url ?? "#"}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={openCookiePreferences}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("footer.cookie_preferences", "Cookie Preferences")}
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
