import { CheckCircle, XCircle } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';

import { serverFetch } from '@/lib/server-fetch';
import type { PageProps } from './page.types';

const i18n = {
  en: {
    invalidTitle: 'Invalid Link',
    invalidBody: 'This confirmation link is missing a token.',
    home: 'Go to Homepage',
    failTitle: 'Confirmation Failed',
    failBody: 'This confirmation link may be invalid or already used.',
    successTitle: "You're Subscribed!",
    successBody: 'Your newsletter subscription has been confirmed. Welcome aboard!',
    shop: 'Start Shopping',
  },
  pl: {
    invalidTitle: 'Nieprawidłowy link',
    invalidBody: 'Temu linkowi potwierdzającemu brakuje tokenu.',
    home: 'Przejdź do strony głównej',
    failTitle: 'Potwierdzenie nie powiodło się',
    failBody: 'Ten link potwierdzający może być nieprawidłowy lub już użyty.',
    successTitle: 'Subskrypcja potwierdzona!',
    successBody: 'Twoja subskrypcja newslettera została potwierdzona. Witaj na pokładzie!',
    shop: 'Zacznij zakupy',
  },
} as const;

export default async function NewsletterConfirmPage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const headersList = await headers();
  const locale = (headersList.get('x-locale') ?? 'en') as keyof typeof i18n;
  const t = i18n[locale] ?? i18n.en;

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <XCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
        <h1 className="text-2xl font-bold">{t.invalidTitle}</h1>
        <p className="text-muted-foreground mt-2">{t.invalidBody}</p>
        <Link href="/" className="mt-6 inline-block underline">
          {t.home}
        </Link>
      </div>
    );
  }

  let success = false;
  try {
    await serverFetch(`/newsletter/confirm/${token}`);
    success = true;
  } catch {
    success = false;
  }

  if (!success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <XCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
        <h1 className="text-2xl font-bold">{t.failTitle}</h1>
        <p className="text-muted-foreground mt-2">{t.failBody}</p>
        <Link href="/" className="mt-6 inline-block underline">
          {t.home}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
      <h1 className="text-2xl font-bold">{t.successTitle}</h1>
      <p className="text-muted-foreground mt-2">{t.successBody}</p>
      <Link
        href="/products"
        className="bg-primary text-primary-foreground mt-6 inline-flex items-center rounded-xl px-6 py-3 font-semibold hover:opacity-90"
      >
        {t.shop}
      </Link>
    </div>
  );
}
