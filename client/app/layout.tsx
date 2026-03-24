import type { Metadata } from "next";
import { cache } from "react";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AdminBar } from "@/components/admin/admin-bar";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { ChatWidgetLoader } from "@/components/chat/chat-widget-loader";
import { GoogleTagManager } from "@/components/layout/google-tag-manager";
import { CookieConsent, type CookieSettings } from "@/components/cookie-consent";
import { ComparisonBar } from "@/components/comparison-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/json-ld";
import { QueryProvider } from "@/providers/query-provider";
import { TranslationProvider } from "@/providers/translation-provider";
import { serverFetch } from "@/lib/server-fetch";
import { buildOrganization, buildWebSite } from "@/lib/schema";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Cached per-request: both generateMetadata and RootLayout share one fetch
type PublicSettingsResponse = {
  settings: {
    general?: {
      site_name?: string;
      site_url?: string;
      site_description?: string;
      contact_email?: string;
      contact_phone?: string;
    };
    seo?: {
      google_tag_manager?: string;
      google_site_verification?: string;
      bing_site_verification?: string;
      disable_indexing?: string | boolean;
      og_image?: string;
      twitter_handle?: string;
    };
    social?: Record<string, string>;
    cookie?: CookieSettings;
  };
};

const getPublicSettings = cache(async () =>
  serverFetch<PublicSettingsResponse>("/settings/public", { revalidate: 300, tags: ["settings"] }).catch(() => null),
);

export async function generateMetadata(): Promise<Metadata> {
  const publicSettings = await getPublicSettings();

  const siteName = publicSettings?.settings.general?.site_name ?? "Store";
  const siteDescription = publicSettings?.settings.general?.site_description;
  const disableIndexing =
    publicSettings?.settings.seo?.disable_indexing === "true" ||
    publicSettings?.settings.seo?.disable_indexing === true;

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription ?? "Your online store",
    robots: disableIndexing ? { index: false, follow: false } : undefined,
    verification: {
      google: publicSettings?.settings.seo?.google_site_verification ?? undefined,
    },
    other: publicSettings?.settings.seo?.bing_site_verification
      ? { "msvalidate.01": publicSettings.settings.seo.bing_site_verification }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "en";
  const isAdminPreview = !!cookieStore.get("admin_preview")?.value;

  const publicSettings = await getPublicSettings();
  const gtmId = publicSettings?.settings.seo?.google_tag_manager ?? null;
  const siteName = publicSettings?.settings.general?.site_name ?? "Store";
  const siteUrl = publicSettings?.settings.general?.site_url;
  const siteDescription = publicSettings?.settings.general?.site_description;
  const contactEmail = publicSettings?.settings.general?.contact_email;
  const contactPhone = publicSettings?.settings.general?.contact_phone;
  const socialLinks = publicSettings?.settings.social;
  const sameAs = socialLinks ? Object.values(socialLinks).filter(Boolean) : [];
  const cookieSettings = publicSettings?.settings.cookie ?? {};

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Preconnect to API origin for faster TTFB on client-side fetches */}
        {process.env.NEXT_PUBLIC_API_URL && (
          <link
            rel="preconnect"
            href={new URL(process.env.NEXT_PUBLIC_API_URL).origin}
          />
        )}
        {/* Preconnect to Cloudflare Turnstile if key is configured */}
        {process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY && (
          <link rel="preconnect" href="https://challenges.cloudflare.com" />
        )}
        {/* Theme: prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'system';if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        {/* Consent Mode v2: default DENIED — must run synchronously before GTM */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"consent_default",analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",functionality_storage:"denied",security_storage:"granted"});`,
          }}
        />
        <JsonLd data={buildWebSite({ name: siteName, url: siteUrl, description: siteDescription })} />
        <JsonLd
          data={buildOrganization({
            name: siteName,
            url: siteUrl,
            email: contactEmail,
            phone: contactPhone,
            sameAs,
          })}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased${isAdminPreview ? " pt-10" : ""}`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:outline-none"
        >
          Skip to main content
        </a>
        <QueryProvider>
          <TranslationProvider initialLocale={locale}>
            <AdminBar />
            <div className="flex min-h-screen flex-col">
              <AnnouncementBar />
              <Header />
              <main id="main-content" className="flex-1">{children}</main>
              <Footer />
            </div>
            <CookieConsent settings={cookieSettings} />
            <ChatWidgetLoader />
            <ComparisonBar />
            <ToastContainer position="bottom-right" autoClose={2000} />
            {gtmId && <GoogleTagManager gtmId={gtmId} />}
          </TranslationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
