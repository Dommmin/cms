export interface CustomerData {
    new_customers: number;
    returning_customers: number;
    new_buyers: number;
    customers_with_orders: number;
    avg_lifetime_value: number;
    chart: Record<string, number>;
}

export interface CustomersProps {
    data: CustomerData;
    filters: {
        from: string;
        to: string;
    };
}
