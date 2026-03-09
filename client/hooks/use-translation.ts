"use client";

import { useContext } from "react";
import { TranslationContext } from "@/providers/translation-provider";

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return ctx;
}
