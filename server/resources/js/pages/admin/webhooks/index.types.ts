export interface Webhook {
    id: number;
    name: string;
    url: string;
    secret: string;
    events: string[];
    is_active: boolean;
    description: string | null;
    last_triggered_at: string | null;
    failure_count: number;
    deliveries_count: number;
    last_delivery_status: 'success' | 'failed' | 'pending' | null;
    created_at: string;
    updated_at: string;
}

export interface IndexProps {
    webhooks: Webhook[];
}
