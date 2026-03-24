export type Customer = {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
};
export type AppNotification = {
    id: number;
    type: string;
    channel: string;
    status: string;
    customer?: Customer | null;
    sent_at: string | null;
    failed_at: string | null;
    error_message: string | null;
    metadata?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
};
export type ShowProps = {
    notification: AppNotification;
};
