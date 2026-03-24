export type Agent = { id: number; name: string };
export type Conversation = {
    id: number;
    subject: string;
    status: string;
    channel: string;
    email: string | null;
    name: string | null;
    last_reply_at: string | null;
    created_at: string;
    messages_count: number;
    unread_messages_count: number;
    assigned_to: Agent | null;
};
export type ConversationsData = {
    data: Conversation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type StatusOption = { value: string; label: string; color: string };
export type IndexProps = {
    conversations: ConversationsData;
    filters: { search?: string; status?: string; assigned_to?: string };
    agents: Agent[];
    open_count: number;
    statuses: StatusOption[];
};
