import type { ApplePaySessionInstance } from '@/components/checkout/apple-pay-button.types';
import type { GooglePayClient } from '@/components/checkout/google-pay-button.types';

declare global {
  interface Window {
    ApplePaySession?: {
      canMakePayments(): boolean;
      new (version: number, request: object): ApplePaySessionInstance;
    };
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: object) => GooglePayClient;
        };
      };
    };
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          theme?: 'auto' | 'light' | 'dark';
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}
