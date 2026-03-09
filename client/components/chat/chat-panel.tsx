"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2Icon, SendIcon, Trash2Icon } from "lucide-react";
import type { SupportMessage } from "@/types/api";

interface Props {
  messages: SupportMessage[];
  isSending: boolean;
  isLoadingMessages: boolean;
  onSend: (body: string) => void;
  onReset: () => void;
  isClosed: boolean;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

export function ChatPanel({ messages, isSending, isLoadingMessages, onSend, onReset, isClosed }: Props) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || isSending) return;
    onSend(text.trim());
    setText("");
  }

  if (isLoadingMessages) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.filter((m) => !m.is_internal).length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8">
            Twoja konwersacja zostanie tutaj wyświetlona.
          </p>
        )}

        {messages
          .filter((m) => !m.is_internal)
          .map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === "customer" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm ${
                  msg.sender_type === "customer"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-muted text-foreground"
                }`}
              >
                {msg.sender_type === "agent" && (
                  <p className="mb-0.5 text-[10px] font-semibold opacity-60">{msg.sender_name}</p>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.body}</p>
                <p className={`mt-0.5 text-[10px] ${msg.sender_type === "customer" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
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
          <p className="mb-2 text-xs text-muted-foreground">Ta konwersacja jest zamknięta.</p>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 mx-auto text-xs text-destructive hover:underline"
          >
            <Trash2Icon className="h-3 w-3" />
            Usuń historię i zacznij nową rozmowę
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border-t px-3 py-2.5 flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Napisz wiadomość..."
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={isSending || !text.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
