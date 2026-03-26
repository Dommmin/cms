'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useForgotPassword } from '@/hooks/use-auth';

export default function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isSuccess, error } = useForgotPassword();
  const [email, setEmail] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    forgotPassword(email);
  }

  const errorMessage =
    // @ts-expect-error axios error shape
    error?.response?.data?.message ?? (error ? 'Request failed. Please try again.' : null);

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center sm:px-6">
        <h1 className="mb-2 text-3xl font-bold">Check your email</h1>
        <p className="text-muted-foreground">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
        </p>
        <Link href="/login" className="mt-8 inline-block text-sm underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24 sm:px-6">
      <h1 className="mb-2 text-center text-3xl font-bold">Reset Password</h1>
      <p className="text-muted-foreground mb-8 text-center">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {errorMessage && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mb-4 rounded-xl border p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
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
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground w-full rounded-xl py-2.5 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Remembered your password?{' '}
        <Link href="/login" className="hover:text-foreground font-medium underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
