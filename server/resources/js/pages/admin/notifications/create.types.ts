export type Customer = {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
};
export type Option = {
    value: string;
    label: string;
};
export type CreateProps = {
    customers: Customer[];
    types: Option[];
    channels: Option[];
};
