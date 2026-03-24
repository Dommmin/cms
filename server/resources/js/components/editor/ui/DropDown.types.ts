export interface DropDownItemProps {
    className?: string;
    onClick: () => void;
    title?: string;
    children: React.ReactNode;
    active?: boolean;
}
export interface DropDownProps {
    label: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    buttonClassName?: string;
    buttonAriaLabel?: string;
    tooltip?: string;
}
