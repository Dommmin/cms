"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMessage,
  getConversation,
  getSupportToken,
  startConversation,
  type StartConversationPayload,
} from "@/api/chat";

export const chatKeys = {
  conversation: (token: string) => ["chat", "conversation", token] as const,
};

export function useConversation(token: string | null) {
  return useQuery({
    queryKey: chatKeys.conversation(token ?? ""),
    queryFn: () => getConversation(token!),
    enabled: !!token,
    staleTime: 5 * 1000,
    refetchInterval: 5 * 1000,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StartConversationPayload) => startConversation(payload),
    onSuccess: (conversation) => {
      queryClient.setQueryData(chatKeys.conversation(conversation.token), conversation);
    },
  });
}

export function useSendMessage(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => addMessage(token, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversation(token) });
    },
  });
}

export function hasSupportToken(): boolean {
  return !!getSupportToken();
}
