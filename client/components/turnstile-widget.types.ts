export interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    className?: string;
}
