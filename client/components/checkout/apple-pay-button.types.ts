export interface ApplePayButtonProps {
  amount: number;
  currency: string;
  onToken: (token: string) => void;
}
export interface ApplePaySessionInstance {
  onvalidatemerchant: (event: { validationURL: string }) => void;
  onpaymentauthorized: (event: { payment: { token: { paymentData: object } } }) => void;
  oncancel: () => void;
  completeMerchantValidation(session: object): void;
  completePayment(status: number): void;
  begin(): void;
}
