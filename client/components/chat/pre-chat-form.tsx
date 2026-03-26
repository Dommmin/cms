'use client';

import { Loader2Icon, SendIcon } from 'lucide-react';
import { useState } from 'react';
import type { PreChatFormProps } from './pre-chat-form.types';

const SUBJECTS = [
  'Pytanie o zamówienie',
  'Problem z produktem',
  'Zwrot / Reklamacja',
  'Pytanie o dostawę',
  'Inne',
];

export function PreChatForm({
  isAuthenticated,
  userName,
  userEmail,
  onSubmit,
  isLoading,
}: PreChatFormProps) {
  const [name, setName] = useState(userName ?? '');
  const [email, setEmail] = useState(userEmail ?? '');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [body, setBody] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, email, subject, body });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <p className="text-muted-foreground text-sm">
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
              className="bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
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
              className="bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
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
          className="bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
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
          className="bg-background ring-offset-background focus:ring-ring w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !body.trim()}
        className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
