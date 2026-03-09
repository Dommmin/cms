"use client";

import { useState } from "react";
import Link from "next/link";

import { useLogin } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { useLocalePath } from "@/hooks/use-locale";
import { SocialLoginButtons } from "@/components/social-login-buttons";

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  const { t } = useTranslation();
  const lp = useLocalePath();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login({ email, password });
  }

  const errorMessage =
    // @ts-expect-error axios error shape
    error?.response?.data?.message ?? (error ? "Login failed. Please try again." : null);

  return (
    <div className="mx-auto max-w-sm px-4 py-24 sm:px-6">
      <h1 className="mb-2 text-center text-3xl font-bold">{t("auth.login_title", "Sign In")}</h1>
      <p className="mb-8 text-center text-muted-foreground">
        {t("auth.welcome_back", "Welcome back! Enter your details to continue.")}
      </p>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            {t("auth.email", "Email address")}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              {t("auth.password", "Password")}
            </label>
            <Link href={lp("/forgot-password")} className="text-xs text-muted-foreground hover:text-foreground">
              {t("auth.forgot_password", "Forgot password?")}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "…" : t("auth.login_btn", "Sign In")}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("auth.or", "or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <SocialLoginButtons />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.no_account", "Don't have an account?")}{" "}
        <Link href={lp("/register")} className="font-medium underline hover:text-foreground">
          {t("auth.sign_up", "Sign up")}
        </Link>
      </p>
    </div>
  );
}
