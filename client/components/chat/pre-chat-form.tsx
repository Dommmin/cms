"use client";

import { useState } from "react";
import { Loader2Icon, SendIcon } from "lucide-react";
import type { PreChatFormProps } from './pre-chat-form.types';

const SUBJECTS = [
  "Pytanie o zamówienie",
  "Problem z produktem",
  "Zwrot / Reklamacja",
  "Pytanie o dostawę",
  "Inne",
];

export function PreChatForm({ isAuthenticated, userName, userEmail, onSubmit, isLoading }: PreChatFormProps) {
  const [name, setName] = useState(userName ?? "");
  const [email, setEmail] = useState(userEmail ?? "");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [body, setBody] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, email, subject, body });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <p className="text-sm text-muted-foreground">
        Opisz swój problem — odpiszemy tak szybko jak to możliwe.
      </p>

      {!isAuthenticated && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium">Imię *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Kowalski"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jan@example.com"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            />
          </div>
        </>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium">Temat *</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Wiadomość *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Opisz swój problem..."
          required
          rows={4}
          className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !body.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <SendIcon className="h-4 w-4" />
        )}
        Rozpocznij czat
      </button>
    </form>
  );
}
