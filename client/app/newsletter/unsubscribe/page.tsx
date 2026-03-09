"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

import { api } from "@/lib/axios";

export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // If token present in URL, auto-unsubscribe via token
  useEffect(() => {
    if (!token) return;
    setStatus("loading");
    api
      .get(`/newsletter/unsubscribe/${token}`)
      .then(() => setStatus("success"))
      .catch(() => {
        setStatus("error");
        setErrorMessage("Could not process your unsubscribe request. The link may be invalid.");
      });
  }, [token]);

  function handleEmailUnsubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    api
      .post("/newsletter/unsubscribe", { email })
      .then(() => setStatus("success"))
      .catch(() => {
        setStatus("error");
        setErrorMessage("Could not unsubscribe. Please try again.");
      });
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
        <h1 className="text-2xl font-bold">Successfully Unsubscribed</h1>
        <p className="mt-2 text-muted-foreground">
          You have been removed from our newsletter list. We&apos;re sorry to see you go!
        </p>
      </div>
    );
  }

  if (token && status === "loading") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <p className="text-muted-foreground">Processing your request…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-24 sm:px-6">
      <h1 className="text-center text-2xl font-bold">Unsubscribe</h1>
      <p className="mt-2 text-center text-muted-foreground">
        Enter your email address to unsubscribe from our newsletter.
      </p>

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleEmailUnsubscribe} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? "Processing…" : "Unsubscribe"}
        </button>
      </form>
    </div>
  );
}
