/**
 * Section Form Component
 * Container metadata: section type, layout, variant.
 * These control how the PUBLIC site renders the wrapper around blocks —
 * they have no visual effect in this admin builder.
 */

import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AvailableSection, Section } from '../types';

type SectionFormProps = {
    section: Section;
    availableSections: Record<string, AvailableSection>;
    onUpdate: (patch: Partial<Section>) => void;
};

export function SectionForm({
    section,
    availableSections,
    onUpdate,
}: SectionFormProps) {
    const currentSectionConfig = availableSections[section.section_type];
    const layouts = currentSectionConfig?.layouts ?? {};

    // Convert layouts (array or keyed object) to value/label pairs
    const layoutOptions = Array.isArray(layouts)
        ? layouts.map((layout) => ({ value: layout, label: layout }))
        : Object.entries(layouts).map(([key, label]) => ({
              value: key,
              label: String(label),
          }));

    // Convert variants (array or keyed object) to value/label pairs
    const rawVariants = currentSectionConfig?.variants;
    const variantOptions = rawVariants
        ? Array.isArray(rawVariants)
            ? rawVariants.map((v) => ({ value: v, label: v }))
            : Object.entries(rawVariants).map(([key, label]) => ({
                  value: key,
                  label: String(label),
              }))
        : [];

    // Ensure layout value is valid for the current section type
    const layoutValue =
        layoutOptions.length > 0
            ? layoutOptions.some((o) => o.value === section.layout)
                ? section.layout
                : layoutOptions[0].value
            : 'default';

    return (
        <div className="space-y-4">
            {/* Info banner */}
            <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                    Section container settings — define how the public site wraps this
                    section. Add <strong>blocks</strong> below to set the actual content.
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Section Type */}
                <div className="space-y-1.5">
                    <Label htmlFor="section-type">Container Type</Label>
                    <Select
                        value={section.section_type || undefined}
                        onValueChange={(value) =>
                            onUpdate({ section_type: value, layout: 'contained', variant: null })
                        }
                    >
                        <SelectTrigger id="section-type">
                            <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(availableSections).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                    {config.label || key}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {currentSectionConfig?.description && (
                        <p className="text-xs text-muted-foreground">
                            {currentSectionConfig.description}
                        </p>
                    )}
                </div>

                {/* Layout */}
                <div className="space-y-1.5">
                    <Label htmlFor="section-layout">Width / Layout</Label>
                    <Select
                        value={layoutValue}
                        onValueChange={(value) => onUpdate({ layout: value })}
                        disabled={layoutOptions.length === 0}
                    >
                        <SelectTrigger id="section-layout">
                            <SelectValue placeholder="Select layout..." />
                        </SelectTrigger>
                        <SelectContent>
                            {layoutOptions.length > 0 ? (
                                layoutOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="default">Default</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Variant */}
                {variantOptions.length > 0 && (
                    <div className="space-y-1.5">
                        <Label htmlFor="section-variant">Background / Style</Label>
                        <Select
                            value={section.variant ?? '_none_'}
                            onValueChange={(value) =>
                                onUpdate({ variant: value === '_none_' ? null : value })
                            }
                        >
                            <SelectTrigger id="section-variant">
                                <SelectValue placeholder="Select style..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_none_">None</SelectItem>
                                {variantOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        </div>
    );
}
