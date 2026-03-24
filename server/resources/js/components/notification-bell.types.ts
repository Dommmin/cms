export interface AdminNotification {
    id: string;
    type: 'new_order' | 'pending_review' | 'low_stock' | 'unread_support';
    title: string;
    message: string;
    created_at: string;
    url: string;
}
