export interface PaymentStatus {
    status:
        | 'pending'
        | 'completed'
        | 'failed'
        | 'authorized'
        | 'refunded'
        | 'partially_refunded';
    order_reference: string | null;
}
