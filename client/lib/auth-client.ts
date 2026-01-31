// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.VITE_API_URL, // Laravel API
});

// Convenience exports — użyjesz tego w komponentach
export const {
  useSession, // hook — current session
  signIn, // login
  signOut, // logout
} = authClient;
