'use client';

import { CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useLocale } from '@/hooks/use-locale';
import { api } from '@/lib/axios';

const i18n = {
  en: {
    title: 'Unsubscribe',
    description: 'Enter your email address to unsubscribe from our newsletter.',
    label: 'Email Address',
    placeholder: 'your@email.com',
    button: 'Unsubscribe',
    loading: 'Processing…',
    successTitle: 'Successfully Unsubscribed',
    successBody: "You have been removed from our newsletter list. We're sorry to see you go!",
    processing: 'Processing your request…',
    errorDefault: 'Could not unsubscribe. Please try again.',
    errorToken: 'Could not process your unsubscribe request. The link may be invalid.',
  },
  pl: {
    title: 'Wypisz się',
    description: 'Podaj swój adres e-mail, aby wypisać się z newslettera.',
    label: 'Adres e-mail',
    placeholder: 'twoj@email.com',
    button: 'Wypisz się',
    loading: 'Przetwarzanie…',
    successTitle: 'Wypisano pomyślnie',
    successBody: 'Zostałeś/aś usunięty/a z naszej listy. Szkoda, że odchodzisz!',
    processing: 'Przetwarzanie żądania…',
    errorDefault: 'Nie można wypisać. Spróbuj ponownie.',
    errorToken: 'Nie można przetworzyć żądania. Link może być nieprawidłowy.',
  },
} as const;

export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const locale = useLocale() as keyof typeof i18n;
  const t = i18n[locale] ?? i18n.en;

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    void Promise.resolve().then(() => setStatus('loading'));
    api
      .get(`/newsletter/unsubscribe/${token}`)
      .then(() => setStatus('success'))
      .catch(() => {
        setStatus('error');
        setErrorMessage(t.errorToken);
      });
  }, [token, t.errorToken]);

  function handleEmailUnsubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    api
      .post('/newsletter/unsubscribe', { email })
      .then(() => setStatus('success'))
      .catch(() => {
        setStatus('error');
        setErrorMessage(t.errorDefault);
      });
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <h1 className="text-2xl font-bold">{t.successTitle}</h1>
        <p className="text-muted-foreground mt-2">{t.successBody}</p>
      </div>
    );
  }

  if (token && status === 'loading') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="text-muted-foreground">{t.processing}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <h1 className="text-center text-2xl font-bold">{t.title}</h1>
      <p className="text-muted-foreground mt-2 text-center">{t.description}</p>

      {status === 'error' && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mt-4 rounded-xl border p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleEmailUnsubscribe} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            {t.label}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            className="border-input bg-background focus:ring-ring w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-primary text-primary-foreground w-full rounded-xl py-2.5 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {status === 'loading' ? t.loading : t.button}
        </button>
      </form>
    </div>
  );
}
