"use client";

import { useState } from "react";

import { api } from "@/lib/axios";
import { useTranslation } from "@/hooks/use-translation";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { t } = useTranslation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await api.post("/newsletter/subscribe", { email });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-green-600">
        {t("newsletter.success", "Check your inbox to confirm your subscription!")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("newsletter.placeholder", "Your email")}
        className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "…" : t("newsletter.subscribe", "Subscribe")}
      </button>
      {status === "error" && (
        <p className="mt-1 text-xs text-destructive">{t("newsletter.error", "Something went wrong.")}</p>
      )}
    </form>
  );
}
