export interface PreChatData {
    name: string;
    email: string;
    subject: string;
    body: string;
}
export interface PreChatFormProps {
    isAuthenticated: boolean;
    userName?: string;
    userEmail?: string;
    onSubmit: (data: PreChatData) => void;
    isLoading: boolean;
}
