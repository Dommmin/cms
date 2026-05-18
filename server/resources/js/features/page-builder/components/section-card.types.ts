import type { AvailableSection, Section } from '../types';

export type SectionCardProps = {
    section: Section;
    index: number;
    isExpanded: boolean;
    isSelected?: boolean;
    availableSections?: Record<string, AvailableSection>;
    onToggle: () => void;
    onDelete: () => void;
    onSelect?: () => void;
    children?: React.ReactNode;
};
