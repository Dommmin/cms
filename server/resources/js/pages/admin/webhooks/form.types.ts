import type { Webhook } from './index.types';

export interface WebhookFormData {
    name: string;
    url: string;
    description: string;
    events: string[];
    is_active: boolean;
}

export interface FormProps {
    webhook?: Webhook;
    available_events: string[];
}
