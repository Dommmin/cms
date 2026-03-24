export type CannedResponse = {
    id: number;
    title: string;
    shortcut: string;
    body: string;
};
export type EditProps = { canned_response: CannedResponse };
