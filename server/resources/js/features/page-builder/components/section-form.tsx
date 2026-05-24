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
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { SectionFormProps } from './section-form.types';

export function SectionForm({
    section,
    availableSections,
    onUpdate,
    compact = false,
    editorMode,
}: SectionFormProps) {
    const __ = useTranslation();
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
                    {__(
                        'builder.section_settings_hint',
                        'Section container settings — define how the public site wraps this section. Add',
                    )}{' '}
                    <strong>{__('builder.blocks', 'blocks')}</strong>{' '}
                    {__(
                        'builder.section_settings_hint_2',
                        'below to set the actual content.',
                    )}
                </span>
            </div>

            <div
                className={cn(
                    'grid gap-4',
                    compact ? 'grid-cols-1' : 'md:grid-cols-3 lg:grid-cols-5',
                )}
            >
                {/* Section Type */}
                <div className="space-y-1.5">
                    <Label htmlFor="section-type">
                        {__('builder.section_type', 'Section Type')}
                    </Label>
                    <Select
                        value={section.section_type || undefined}
                        onValueChange={(value) =>
                            onUpdate({
                                section_type: value,
                                layout: 'contained',
                                variant: null,
                            })
                        }
                    >
                        <SelectTrigger id="section-type">
                            <SelectValue
                                placeholder={__(
                                    'builder.select_type',
                                    'Select type...',
                                )}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(availableSections).map(
                                ([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        {config.label || key}
                                    </SelectItem>
                                ),
                            )}
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
                    <Label htmlFor="section-layout">
                        {__('builder.width_layout', 'Width / Layout')}
                    </Label>
                    <Select
                        value={layoutValue}
                        onValueChange={(value) => onUpdate({ layout: value })}
                        disabled={layoutOptions.length === 0}
                    >
                        <SelectTrigger id="section-layout">
                            <SelectValue
                                placeholder={__(
                                    'builder.select_layout',
                                    'Select layout...',
                                )}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {layoutOptions.length > 0 ? (
                                layoutOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="default">
                                    {__('builder.default', 'Default')}
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Padding */}
                <div className="space-y-1.5">
                    <Label htmlFor="section-padding">
                        {__('builder.spacing', 'Spacing')}
                    </Label>
                    <Select
                        value={
                            (section.settings?.padding as string | undefined) ??
                            'lg'
                        }
                        onValueChange={(value) =>
                            onUpdate({
                                settings: {
                                    ...section.settings,
                                    padding: value,
                                },
                            })
                        }
                    >
                        <SelectTrigger id="section-padding">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">
                                {__('builder.no_padding', 'No padding')}
                            </SelectItem>
                            <SelectItem value="sm">
                                {__('builder.small', 'Small')}
                            </SelectItem>
                            <SelectItem value="md">
                                {__('builder.medium', 'Medium')}
                            </SelectItem>
                            <SelectItem value="lg">
                                {__('builder.large_default', 'Large (default)')}
                            </SelectItem>
                            <SelectItem value="xl">
                                {__('builder.extra_large', 'Extra large')}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {editorMode === 'advanced' && (
                    <div className="space-y-1.5">
                        <Label htmlFor="section-animation">
                            {__('builder.scroll_animation', 'Scroll Animation')}
                        </Label>
                        <Select
                            value={
                                (section.settings?.animation as
                                    | string
                                    | undefined) ?? 'none'
                            }
                            onValueChange={(value) =>
                                onUpdate({
                                    settings: {
                                        ...section.settings,
                                        animation:
                                            value === 'none'
                                                ? undefined
                                                : value,
                                    },
                                })
                            }
                        >
                            <SelectTrigger id="section-animation">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    {__('builder.none', 'None')}
                                </SelectItem>
                                <SelectItem value="fade-in">
                                    {__('builder.fade_in', 'Fade In')}
                                </SelectItem>
                                <SelectItem value="fade-up">
                                    {__('builder.fade_up', 'Fade Up')}
                                </SelectItem>
                                <SelectItem value="fade-left">
                                    {__(
                                        'builder.slide_from_left',
                                        'Slide from Left',
                                    )}
                                </SelectItem>
                                <SelectItem value="fade-right">
                                    {__(
                                        'builder.slide_from_right',
                                        'Slide from Right',
                                    )}
                                </SelectItem>
                                <SelectItem value="zoom-in">
                                    {__('builder.zoom_in', 'Zoom In')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Variant */}
                {variantOptions.length > 0 && (
                    <div className="space-y-1.5">
                        <Label htmlFor="section-variant">
                            {__(
                                'builder.background_style',
                                'Background / Style',
                            )}
                        </Label>
                        <Select
                            value={section.variant ?? '_none_'}
                            onValueChange={(value) =>
                                onUpdate({
                                    variant: value === '_none_' ? null : value,
                                })
                            }
                        >
                            <SelectTrigger id="section-variant">
                                <SelectValue
                                    placeholder={__(
                                        'builder.select_style',
                                        'Select style...',
                                    )}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_none_">
                                    {__('builder.none', 'None')}
                                </SelectItem>
                                {variantOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
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
