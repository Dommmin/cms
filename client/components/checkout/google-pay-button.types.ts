export interface GooglePayButtonProps {
  amount: number;
  currency: string;
  onToken: (token: string) => void;
}
export interface GooglePayClient {
  isReadyToPay(request: object): Promise<{ result: boolean }>;
  loadPaymentData(
    request: object,
  ): Promise<{ paymentMethodData: { tokenizationData: { token: string } } }>;
  createButton(config: object): HTMLElement;
}
