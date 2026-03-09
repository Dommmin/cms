"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { toast } from "react-toastify";
import {
  clearSupportToken,
  getSupportToken,
  setSupportToken,
} from "@/api/chat";
import { useConversation, useSendMessage, useStartConversation } from "@/hooks/use-chat";
import { ChatPanel } from "./chat-panel";
import { PreChatForm, type PreChatData } from "./pre-chat-form";

interface Props {
  isAuthenticated?: boolean;
  userName?: string;
  userEmail?: string;
}

const OPEN_KEY = "support_open";

export function ChatWidget({ isAuthenticated = false, userName, userEmail }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const prevMessageCount = useRef(0);

  // Restore persisted state on mount
  useEffect(() => {
    const savedToken = getSupportToken();
    setToken(savedToken);
    const savedOpen = localStorage.getItem(OPEN_KEY);
    if (savedOpen === "true") setIsOpen(true);
  }, []);

  // Persist open state
  useEffect(() => {
    localStorage.setItem(OPEN_KEY, String(isOpen));
  }, [isOpen]);

  const { data: conversation, isLoading: isLoadingMessages } = useConversation(token);
  const startConversation = useStartConversation();
  const sendMessage = useSendMessage(token ?? "");

  // Notify user when a new agent message arrives while widget is closed
  useEffect(() => {
    if (!conversation?.messages) return;
    const visibleMessages = conversation.messages.filter((m) => !m.is_internal);
    const count = visibleMessages.length;
    if (count > prevMessageCount.current && prevMessageCount.current > 0 && !isOpen) {
      const lastMsg = visibleMessages[count - 1];
      if (lastMsg.sender_type === "agent") {
        toast.info(`Nowa wiadomość od wsparcia: ${lastMsg.sender_name}`);
      }
    }
    prevMessageCount.current = count;
  }, [conversation?.messages, isOpen]);

  async function handlePreChatSubmit(data: PreChatData) {
    const result = await startConversation.mutateAsync({
      email: data.email || undefined,
      name: data.name || undefined,
      subject: data.subject,
      body: data.body,
      channel: "widget",
    });
    setSupportToken(result.token);
    setToken(result.token);
  }

  async function handleSend(body: string) {
    if (!token) return;
    await sendMessage.mutateAsync(body);
  }

  function handleReset() {
    clearSupportToken();
    setToken(null);
    prevMessageCount.current = 0;
  }

  const hasToken = !!token;
  const isClosed =
    conversation?.status === "resolved" || conversation?.status === "closed";

  const unreadCount =
    conversation?.messages.filter(
      (m) => !m.is_internal && m.sender_type === "agent" && !m.read_at,
    ).length ?? 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex w-[380px] max-h-[600px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-primary px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Wsparcie klienta</p>
                <p className="text-[11px] text-primary-foreground/70">Odpiszemy tak szybko jak to możliwe</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-primary-foreground/80 hover:text-primary-foreground"
                aria-label="Zamknij"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {hasToken ? (
                <ChatPanel
                  messages={conversation?.messages ?? []}
                  isSending={sendMessage.isPending}
                  isLoadingMessages={isLoadingMessages}
                  onSend={handleSend}
                  onReset={handleReset}
                  isClosed={isClosed ?? false}
                />
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <PreChatForm
                    isAuthenticated={isAuthenticated}
                    userName={userName}
                    userEmail={userEmail}
                    onSubmit={handlePreChatSubmit}
                    isLoading={startConversation.isPending}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
        aria-label={isOpen ? "Zamknij czat" : "Otwórz czat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <XIcon className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircleIcon className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
}
