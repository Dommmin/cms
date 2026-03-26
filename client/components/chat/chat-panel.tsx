'use client';

import { Loader2Icon, SendIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChatPanelProps } from './chat-panel.types';

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export function ChatPanel({
  messages,
  isSending,
  isLoadingMessages,
  onSend,
  onReset,
  isClosed,
}: ChatPanelProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || isSending) return;
    onSend(text.trim());
    setText('');
  }

  if (isLoadingMessages) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Loader2Icon className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.filter((m) => !m.is_internal).length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-xs">
            Twoja konwersacja zostanie tutaj wyświetlona.
          </p>
        )}

        {messages
          .filter((m) => !m.is_internal)
          .map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm ${
                  msg.sender_type === 'customer'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}
              >
                {msg.sender_type === 'agent' && (
                  <p className="mb-0.5 text-[10px] font-semibold opacity-60">{msg.sender_name}</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                <p
                  className={`mt-0.5 text-[10px] ${msg.sender_type === 'customer' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}
                >
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      {isClosed ? (
        <div className="border-t px-4 py-3 text-center">
          <p className="text-muted-foreground mb-2 text-xs">Ta konwersacja jest zamknięta.</p>
          <button
            type="button"
            onClick={onReset}
            className="text-destructive mx-auto flex items-center gap-1.5 text-xs hover:underline"
          >
            <Trash2Icon className="h-3 w-3" />
            Usuń historię i zacznij nową rozmowę
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t px-3 py-2.5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Napisz wiadomość..."
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="bg-background ring-offset-background focus:ring-ring flex-1 resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          />
          <button
            type="submit"
            disabled={isSending || !text.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Wyślij"
          >
            {isSending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </button>
        </form>
      )}
    </>
  );
}
