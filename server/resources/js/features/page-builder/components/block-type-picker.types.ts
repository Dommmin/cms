import type { BlockTypeConfig } from '../types';

export type BlockTypePickerProps = {
    open: boolean;
    availableBlockTypes: Record<string, BlockTypeConfig>;
    onSelect: (type: string) => void;
    onClose: () => void;
};
