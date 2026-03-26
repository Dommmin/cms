import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

import { serverFetch } from '@/lib/server-fetch';
import type { PageProps } from './page.types';

export default async function NewsletterConfirmPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <XCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
        <h1 className="text-2xl font-bold">Invalid Link</h1>
        <p className="text-muted-foreground mt-2">This confirmation link is missing a token.</p>
        <Link href="/" className="mt-6 inline-block underline">
          Go to Homepage
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
        <h1 className="text-2xl font-bold">Confirmation Failed</h1>
        <p className="text-muted-foreground mt-2">
          This confirmation link may be invalid or already used.
        </p>
        <Link href="/" className="mt-6 inline-block underline">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
      <h1 className="text-2xl font-bold">You&apos;re Subscribed!</h1>
      <p className="text-muted-foreground mt-2">
        Your newsletter subscription has been confirmed. Welcome aboard!
      </p>
      <Link
        href="/products"
        className="bg-primary text-primary-foreground mt-6 inline-flex items-center rounded-xl px-6 py-3 font-semibold hover:opacity-90"
      >
        Start Shopping
      </Link>
    </div>
  );
}
