import type { Webhook } from './index.types';

export interface WebhookDelivery {
    id: number;
    webhook_id: number;
    event: string;
    payload: Record<string, unknown>;
    status: 'pending' | 'success' | 'failed';
    attempt: number;
    response_status: number | null;
    response_body: string | null;
    duration_ms: number | null;
    delivered_at: string | null;
    created_at: string;
}

export interface DeliveriesProps {
    webhook: Webhook;
    deliveries: {
        data: WebhookDelivery[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
}
