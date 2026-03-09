/**
 * Section Card Component
 * Displays a draggable section with shadcn/ui styling
 * Follows Open/Closed Principle - extensible through props
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ChevronDown,
    ChevronUp,
    GripVertical,
    Layers,
    Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AvailableSection, Section } from '../types';

type SectionCardProps = {
    section: Section;
    index: number;
    isExpanded: boolean;
    availableSections?: Record<string, AvailableSection>;
    onToggle: () => void;
    onDelete: () => void;
    children?: React.ReactNode;
};

export function SectionCard({
    section,
    index,
    isExpanded,
    availableSections,
    onToggle,
    onDelete,
    children,
}: SectionCardProps) {
    const sectionLabel =
        (availableSections?.[section.section_type]?.label ?? section.section_type)
        || 'Untitled Section';
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `section-${index}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(isDragging && 'shadow-lg')}
        >
            <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                    {/* Drag Handle */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Expand/Collapse */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className="h-8 w-8 p-0"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>

                    {/* Section Icon */}
                    <Layers className="h-4 w-4 text-muted-foreground" />

                    {/* Section Title */}
                    <div className="flex-1 cursor-pointer" onClick={onToggle}>
                        <h3 className="font-medium">{sectionLabel}</h3>
                        {section.layout && section.layout !== 'default' && (
                            <p className="text-sm text-muted-foreground">
                                Layout: {section.layout}
                            </p>
                        )}
                    </div>

                    {/* Block Count Badge */}
                    <Badge variant="secondary">
                        {section.blocks?.length ?? 0} blocks
                    </Badge>

                    {/* Delete Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-4 border-t pt-4">
                    {children}
                </CardContent>
            )}
        </Card>
    );
}
