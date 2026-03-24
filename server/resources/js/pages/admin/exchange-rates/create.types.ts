export type Currency = {
    id: number;
    code: string;
    name: string;
};
export type CreateProps = {
    currencies: Currency[];
};
