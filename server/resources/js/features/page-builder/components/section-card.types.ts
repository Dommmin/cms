import type { AvailableSection, Section } from '../types';

export type SectionCardProps = {
    section: Section;
    index: number;
    isExpanded: boolean;
    availableSections?: Record<string, AvailableSection>;
    onToggle: () => void;
    onDelete: () => void;
    children?: React.ReactNode;
};
