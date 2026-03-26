'use client';

import Link from 'next/link';
import { useState } from 'react';

import { SocialLoginButtons } from '@/components/social-login-buttons';
import { TurnstileWidget } from '@/components/turnstile-widget';
import { useLogin } from '@/hooks/use-auth';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  const { t } = useTranslation();
  const lp = useLocalePath();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login({ email, password, cf_turnstile_response: turnstileToken || undefined });
  }

  const errorMessage =
    // @ts-expect-error axios error shape
    error?.response?.data?.message ?? (error ? 'Login failed. Please try again.' : null);

  return (
    <div className="mx-auto max-w-sm px-4 py-24 sm:px-6">
      <h1 className="mb-2 text-center text-3xl font-bold">{t('auth.login_title', 'Sign In')}</h1>
      <p className="text-muted-foreground mb-8 text-center">
        {t('auth.welcome_back', 'Welcome back! Enter your details to continue.')}
      </p>

      {errorMessage && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mb-4 rounded-xl border p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            {t('auth.email', 'Email address')}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-input bg-background focus:ring-ring w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              {t('auth.password', 'Password')}
            </label>
            <Link
              href={lp('/forgot-password')}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              {t('auth.forgot_password', 'Forgot password?')}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="border-input bg-background focus:ring-ring w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
          />
        </div>

        <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken('')} />

        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground w-full rounded-xl py-2.5 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? '…' : t('auth.login_btn', 'Sign In')}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">{t('auth.or', 'or')}</span>
        <div className="bg-border h-px flex-1" />
      </div>

      <SocialLoginButtons />

      <p className="text-muted-foreground mt-6 text-center text-sm">
        {t('auth.no_account', "Don't have an account?")}{' '}
        <Link href={lp('/register')} className="hover:text-foreground font-medium underline">
          {t('auth.sign_up', 'Sign up')}
        </Link>
      </p>
    </div>
  );
}
