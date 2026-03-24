export interface DropdownColorPickerProps {
    color: string;
    onChange?: (color: string) => void;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    tooltip?: string;
}
