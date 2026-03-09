"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRef } from "react";

import { makeQueryClient } from "@/lib/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Use ref so the QueryClient is only created once per component lifetime,
  // even in React Strict Mode with double-invocations.
  const clientRef = useRef<ReturnType<typeof makeQueryClient> | null>(null);
  if (!clientRef.current) {
    clientRef.current = makeQueryClient();
  }

  return (
    <QueryClientProvider client={clientRef.current}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
