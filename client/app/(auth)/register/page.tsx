"use client";

import { useState } from "react";
import Link from "next/link";

import { useRegister } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { useLocalePath } from "@/hooks/use-locale";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import { TurnstileWidget } from "@/components/turnstile-widget";

export default function RegisterPage() {
  const { mutate: register, isPending, error } = useRegister();
  const { t } = useTranslation();
  const lp = useLocalePath();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [turnstileToken, setTurnstileToken] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register({ ...form, cf_turnstile_response: turnstileToken || undefined });
  }

  const errorMessage =
    // @ts-expect-error axios error shape
    error?.response?.data?.message ?? (error ? "Registration failed. Please try again." : null);

  return (
    <div className="mx-auto max-w-sm px-4 py-24 sm:px-6">
      <h1 className="mb-2 text-center text-3xl font-bold">{t("auth.register_title", "Create Account")}</h1>
      <p className="mb-8 text-center text-muted-foreground">
        {t("auth.register_desc", "Join us to unlock your full shopping experience.")}
      </p>

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            {t("auth.full_name", "Full Name")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium">
            Confirm Password
          </label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            required
            value={form.password_confirmation}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <TurnstileWidget
          onVerify={setTurnstileToken}
          onExpire={() => setTurnstileToken("")}
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "…" : t("auth.register_btn", "Create Account")}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">{t("auth.or", "or")}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <SocialLoginButtons />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.have_account", "Already have an account?")}{" "}
        <Link href={lp("/login")} className="font-medium underline hover:text-foreground">
          {t("auth.sign_in_link", "Sign in")}
        </Link>
      </p>
    </div>
  );
}
