import type { SupportMessage } from "@/types/api";

export interface ChatPanelProps {
  messages: SupportMessage[];
  isSending: boolean;
  isLoadingMessages: boolean;
  onSend: (body: string) => void;
  onReset: () => void;
  isClosed: boolean;
}
