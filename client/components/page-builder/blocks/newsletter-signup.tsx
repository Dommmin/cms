'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { subscribe } from '@/api/newsletter';
import { TurnstileWidget } from '@/components/turnstile-widget';
import type { NewsletterSignupConfig, NewsletterSignupProps } from './newsletter-signup.types';

export function NewsletterSignupBlock({ block }: NewsletterSignupProps) {
  const cfg = block.configuration as NewsletterSignupConfig;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribe({
        email,
        name: cfg.ask_name ? name : undefined,
        cf_turnstile_response: turnstileToken || undefined,
      });
      setDone(true);
      toast.success(cfg.success_message ?? 'Thanks for subscribing!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="text-4xl">🎉</div>
        <p className="text-lg font-semibold">{cfg.success_message ?? "You're subscribed!"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {cfg.title && <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>}
      {cfg.subtitle && <p className="text-muted-foreground max-w-xl">{cfg.subtitle}</p>}

      <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3">
        {cfg.ask_name && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="border-input bg-background focus:ring-ring w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2"
          />
        )}
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={cfg.placeholder ?? 'Enter your email'}
            className="border-input bg-background focus:ring-ring min-w-0 flex-1 rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-lg px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? '...' : (cfg.button_text ?? 'Subscribe')}
          </button>
        </div>
        <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} />
      </form>
    </div>
  );
}
