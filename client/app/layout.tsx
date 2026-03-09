import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { GoogleTagManager } from "@/components/layout/google-tag-manager";
import { CookieConsent, type CookieSettings } from "@/components/cookie-consent";
import { ChatWidget } from "@/components/chat/chat-widget";
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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Store",
    template: "%s | Store",
  },
  description: "Your online store",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "en";

  type PublicSettingsResponse = {
    settings: {
      general?: {
        site_name?: string;
        site_url?: string;
        site_description?: string;
        contact_email?: string;
        contact_phone?: string;
      };
      seo?: { google_tag_manager?: string };
      social?: Record<string, string>;
      cookie?: CookieSettings;
    };
  };

  const publicSettings = await serverFetch<PublicSettingsResponse>("/settings/public").catch(
    () => null,
  );
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <TranslationProvider initialLocale={locale}>
            <div className="flex min-h-screen flex-col">
              <AnnouncementBar />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CookieConsent settings={cookieSettings} />
            <ChatWidget />
            <ComparisonBar />
            <ToastContainer position="top-right" autoClose={4000} />
            {gtmId && <GoogleTagManager gtmId={gtmId} />}
          </TranslationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
