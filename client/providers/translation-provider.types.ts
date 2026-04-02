export type TranslationContextType = {
  t: (key: string, fallback?: string) => string;
  locale: string;
  setLocale: (locale: string) => void;
  isLoading: boolean;
};

export interface TranslationProviderProps {
  children: React.ReactNode;
  initialLocale?: string;
}
