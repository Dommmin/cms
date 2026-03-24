export interface Position {
    x: number;
    y: number;
}
export interface MoveWrapperProps {
    className?: string;
    style?: React.CSSProperties;
    onChange: (position: Position) => void;
    children: React.ReactNode;
}
export interface HSV {
    h: number;
    s: number;
    v: number;
}
export interface ColorPickerProps {
    color: string;
    onChange?: (color: string) => void;
}
