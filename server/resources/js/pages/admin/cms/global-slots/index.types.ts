export interface ReusableBlock {
    id: number;
    name: string;
    type: string;
}

export interface SlotSettings {
    full_width?: boolean;
    sticky?: boolean;
    dismissible?: boolean;
    bg_color?: string | null;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    [key: string]: string | number | boolean | null | undefined;
}

export interface GlobalSlot {
    id: number;
    location: string;
    reusable_block_id: number | null;
    label: string;
    configuration: Record<string, unknown> | null;
    is_active: boolean;
    position: number;
    settings: SlotSettings | null;
    reusable_block?: {
        id: number;
        name: string;
        type: string;
    } | null;
}

export interface SlotLocation {
    value: string;
    label: string;
    default_settings: SlotSettings;
}

export interface IndexProps {
    slots: GlobalSlot[];
    locations: SlotLocation[];
    reusable_blocks: ReusableBlock[];
}
