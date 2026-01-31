"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/query-client";
import type { ReactNode } from "react";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {ThemeProvider} from "@/components/theme-provider";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar
                theme="colored"
            />
            {children}
        </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
