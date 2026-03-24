export type Customer = {
    id: number;
    first_name: string;
    last_name: string;
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
    created_at: string;
};
export type NotificationsData = {
    data: AppNotification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
export type IndexProps = {
    notifications: NotificationsData;
    filters: {
        search?: string;
        type?: string;
        status?: string;
        channel?: string;
    };
};
