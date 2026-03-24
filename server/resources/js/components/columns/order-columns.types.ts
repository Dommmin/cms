export type OrderRow = {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total: number;
    customer?: {
        first_name: string;
        last_name: string;
        email: string;
    };
    created_at: string;
};
