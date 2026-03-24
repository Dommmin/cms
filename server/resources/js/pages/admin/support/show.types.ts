export type Agent = { id: number; name: string };
export type StatusOption = { value: string; label: string; color: string };
export type Message = {
    id: number;
    sender_type: 'customer' | 'agent';
    sender_name: string;
    body: string;
    is_internal: boolean;
    read_at: string | null;
    created_at: string;
};
export type Order = {
    id: number;
    reference_number: string;
    status: string;
    total: number;
};
export type Customer = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    orders?: Order[];
};
export type Conversation = {
    id: number;
    subject: string;
    status: string;
    channel: string;
    email: string | null;
    name: string | null;
    created_at: string;
    last_reply_at: string | null;
    messages: Message[];
    assigned_to: Agent | null;
    customer: Customer | null;
};
export type CannedResponse = {
    id: number;
    title: string;
    shortcut: string;
    body: string;
};
export type ShowProps = {
    conversation: Conversation;
    agents: Agent[];
    canned_responses: CannedResponse[];
    statuses: StatusOption[];
};
