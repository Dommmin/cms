import { isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR: żeby po hydratacji nie refetchowało natychmiast
        staleTime: 60 * 1000, // 1 min
        // Nie retry w dev — łatwiej debugować
        retry: isServer ? 0 : 3,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: zawsze nowy client (per request)
    return makeQueryClient();
  }

  // Browser: jeden instance na całą app
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
