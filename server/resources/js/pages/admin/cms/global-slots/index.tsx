import { Head, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ChevronRight,
    Eye,
    EyeOff,
    GripVertical,
    Layers,
    Layout,
    Plus,
    Settings,
    Sparkles,
    Trash,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as GlobalSlotController from '@/actions/App/Http/Controllers/Admin/Cms/GlobalSlotController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type {
    GlobalSlot,
    IndexProps,
    SlotLocation,
    SlotSettings,
} from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'CMS', href: '#' },
    { title: 'Global Slots & Widgets', href: '' },
];

export default function GlobalSlotsIndex({
    slots,
    locations,
    reusable_blocks,
}: IndexProps) {
    const __ = useTranslation();
    const [selectedLocation, setSelectedLocation] = useState<string>(
        locations[0]?.value ?? '',
    );

    // Add/Edit Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [activeSlot, setActiveSlot] = useState<GlobalSlot | null>(null);

    // Form fields
    const [label, setLabel] = useState('');
    const [reusableBlockId, setReusableBlockId] = useState<string>('none');
    const [settings, setSettings] = useState<SlotSettings>({});
    const [inlineHtml, setInlineHtml] = useState('');

    const locationMap = locations.reduce<Record<string, SlotLocation>>(
        (acc, loc) => {
            acc[loc.value] = loc;
            return acc;
        },
        {},
    );

    const activeLocationObj = locationMap[selectedLocation];
    const filteredSlots = slots.filter(
        (slot) => slot.location === selectedLocation,
    );

    const handleAddOpen = () => {
        setLabel('');
        setReusableBlockId('none');
        setInlineHtml('');
        setSettings(activeLocationObj?.default_settings ?? {});
        setIsAddOpen(true);
    };

    const handleEditOpen = (slot: GlobalSlot) => {
        setActiveSlot(slot);
        setLabel(slot.label);
        setReusableBlockId(
            slot.reusable_block_id ? String(slot.reusable_block_id) : 'none',
        );
        setInlineHtml(
            slot.configuration?.html ? String(slot.configuration.html) : '',
        );
        setSettings(slot.settings ?? {});
        setIsEditOpen(true);
    };

    const handleCreateSlot = () => {
        if (!label.trim()) return;

        const payload = {
            location: selectedLocation,
            label: label,
            reusable_block_id:
                reusableBlockId === 'none' ? null : Number(reusableBlockId),
            configuration:
                reusableBlockId === 'none' ? { html: inlineHtml } : null,
            settings: settings,
            is_active: true,
        };

        router.post(GlobalSlotController.store.url(), payload, {
            onSuccess: () => {
                toast.success(
                    __('misc.slot_created', 'Global slot created successfully'),
                );
                setIsAddOpen(false);
            },
            onError: () =>
                toast.error(
                    __('misc.create_failed', 'Failed to create global slot'),
                ),
        });
    };

    const handleUpdateSlot = () => {
        if (!activeSlot || !label.trim()) return;

        const payload = {
            label: label,
            reusable_block_id:
                reusableBlockId === 'none' ? null : Number(reusableBlockId),
            configuration:
                reusableBlockId === 'none' ? { html: inlineHtml } : null,
            settings: settings,
        };

        router.put(GlobalSlotController.update.url(activeSlot.id), payload, {
            onSuccess: () => {
                toast.success(
                    __('misc.slot_updated', 'Global slot updated successfully'),
                );
                setIsEditOpen(false);
                setActiveSlot(null);
            },
            onError: () =>
                toast.error(
                    __('misc.update_failed', 'Failed to update global slot'),
                ),
        });
    };

    const handleToggleActive = (slot: GlobalSlot) => {
        router.patch(
            GlobalSlotController.toggle.url(slot.id),
            { is_active: !slot.is_active },
            {
                onSuccess: () => {
                    toast.success(
                        slot.is_active
                            ? __('misc.slot_disabled', 'Slot disabled')
                            : __('misc.slot_enabled', 'Slot enabled'),
                    );
                },
                onError: () =>
                    toast.error(__('misc.toggle_failed', 'Operation failed')),
            },
        );
    };

    const handleDeleteSlot = () => {
        if (!activeSlot) return;

        router.delete(GlobalSlotController.destroy.url(activeSlot.id), {
            onSuccess: () => {
                toast.success(
                    __('misc.slot_deleted', 'Global slot deleted successfully'),
                );
                setIsDeleteOpen(false);
                setActiveSlot(null);
            },
            onError: () =>
                toast.error(__('misc.delete_failed', 'Failed to delete slot')),
        });
    };

    const moveSlot = (index: number, direction: 'up' | 'down') => {
        const nextIndex = direction === 'up' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= filteredSlots.length) return;

        const updatedSlots = [...filteredSlots];
        const temp = updatedSlots[index];
        updatedSlots[index] = updatedSlots[nextIndex];
        updatedSlots[nextIndex] = temp;

        const reordered = updatedSlots.map((slot, i) => ({
            id: slot.id,
            position: i,
        }));

        // Instantly update layout locally for smooth user feedback
        router.post(
            GlobalSlotController.reorder.url(),
            { slots: reordered },
            {
                onSuccess: () =>
                    toast.success(
                        __('misc.order_updated', 'Display order saved'),
                    ),
                onError: () =>
                    toast.error(
                        __('misc.reorder_failed', 'Failed to save order'),
                    ),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={__('page.global_slots', 'Global Slots & Widget Areas')}
            />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Layout className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {__(
                                    'page.global_slots_title',
                                    'Global Theme Slots',
                                )}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {__(
                                    'page.global_slots_desc',
                                    'Inject global widget rows, trust badges, or sticky panels across your entire storefront.',
                                )}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleAddOpen} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {__('action.add_widget', 'Add Widget to Slot')}
                    </Button>
                </div>

                {/* Dashboard Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left: Location Selector */}
                    <div className="space-y-3">
                        <h2 className="px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            {__('misc.theme_slots', 'Storefront Zones')}
                        </h2>
                        <div className="space-y-1">
                            {locations.map((loc) => {
                                const locSlots = slots.filter(
                                    (s) => s.location === loc.value,
                                );
                                const activeCount = locSlots.filter(
                                    (s) => s.is_active,
                                ).length;
                                const isSelected =
                                    selectedLocation === loc.value;

                                return (
                                    <button
                                        key={loc.value}
                                        onClick={() =>
                                            setSelectedLocation(loc.value)
                                        }
                                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all duration-200 ${
                                            isSelected
                                                ? 'border-primary bg-primary font-medium text-primary-foreground shadow-md shadow-primary/15'
                                                : 'border-border bg-card text-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <Layers
                                                className={`h-4.5 w-4.5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                                            />
                                            <span className="truncate text-sm">
                                                {loc.label}
                                            </span>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            {activeCount > 0 && (
                                                <Badge
                                                    variant={
                                                        isSelected
                                                            ? 'outline'
                                                            : 'secondary'
                                                    }
                                                    className={`h-5 px-1.5 text-xs font-bold ${
                                                        isSelected
                                                            ? 'border-primary-foreground text-primary-foreground'
                                                            : 'border-none bg-green-500/10 text-green-600'
                                                    }`}
                                                >
                                                    {activeCount}{' '}
                                                    {activeCount === 1
                                                        ? __(
                                                              'misc.active_one',
                                                              'active',
                                                          )
                                                        : __(
                                                              'misc.active_many',
                                                              'active',
                                                          )}
                                                </Badge>
                                            )}
                                            <ChevronRight className="h-4 w-4 opacity-70" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Selected Location Slot Content */}
                    <div className="space-y-4 md:col-span-2">
                        <Card className="border-border shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b pb-3">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                        {activeLocationObj?.label}
                                        <Sparkles className="h-4 w-4 fill-amber-500/20 text-amber-500" />
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-xs">
                                        {__(
                                            'misc.active_in_slot',
                                            'Widgets rendering in this location order.',
                                        )}
                                    </CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleAddOpen}
                                    className="gap-1 text-xs"
                                >
                                    <Plus className="h-3 w-3" />
                                    {__('action.new', 'New')}
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                {filteredSlots.length === 0 ? (
                                    <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
                                        <Layout className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                                        <h3 className="text-sm font-semibold">
                                            {__(
                                                'empty.no_slot_widgets',
                                                'No widgets in this slot',
                                            )}
                                        </h3>
                                        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                                            {__(
                                                'empty.no_slot_widgets_desc',
                                                'Add a global block or custom raw HTML widget to render in this storefront area.',
                                            )}
                                        </p>
                                        <Button
                                            size="sm"
                                            onClick={handleAddOpen}
                                            className="mt-4 gap-1.5 text-xs"
                                        >
                                            <Plus className="h-3 w-3" />
                                            {__(
                                                'action.add_first',
                                                'Add First Widget',
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredSlots.map((slot, index) => (
                                            <div
                                                key={slot.id}
                                                className={`flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md ${
                                                    slot.is_active
                                                        ? 'border-border'
                                                        : 'border-dashed bg-muted/10 opacity-60'
                                                }`}
                                            >
                                                {/* Drag / Reorder Handles */}
                                                <div className="flex shrink-0 flex-col items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-md hover:bg-muted"
                                                        disabled={index === 0}
                                                        onClick={() =>
                                                            moveSlot(
                                                                index,
                                                                'up',
                                                            )
                                                        }
                                                    >
                                                        <ArrowUp className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-md hover:bg-muted"
                                                        disabled={
                                                            index ===
                                                            filteredSlots.length -
                                                                1
                                                        }
                                                        onClick={() =>
                                                            moveSlot(
                                                                index,
                                                                'down',
                                                            )
                                                        }
                                                    >
                                                        <ArrowDown className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>

                                                {/* Details */}
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate text-sm font-semibold">
                                                            {slot.label}
                                                        </span>
                                                        <Badge
                                                            variant={
                                                                slot.is_active
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className="h-4.5 px-1.5 text-[10px]"
                                                        >
                                                            {slot.reusable_block
                                                                ? __(
                                                                      'misc.global_block',
                                                                      'Library Block',
                                                                  )
                                                                : __(
                                                                      'misc.inline_html',
                                                                      'Custom HTML',
                                                                  )}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                                        {slot.reusable_block ? (
                                                            <>
                                                                <span className="rounded bg-muted px-1 font-mono text-primary">
                                                                    {
                                                                        slot
                                                                            .reusable_block
                                                                            .type
                                                                    }
                                                                </span>
                                                                <span>·</span>
                                                                <span className="max-w-[150px] truncate italic">
                                                                    "
                                                                    {
                                                                        slot
                                                                            .reusable_block
                                                                            .name
                                                                    }
                                                                    "
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span>
                                                                {__(
                                                                    'misc.inline_raw_html',
                                                                    'Inline rendered HTML code',
                                                                )}
                                                            </span>
                                                        )}
                                                        {slot.settings
                                                            ?.bg_color && (
                                                            <>
                                                                <span>·</span>
                                                                <span className="flex items-center gap-1 font-mono text-[10px]">
                                                                    <span
                                                                        className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                                                                        style={{
                                                                            backgroundColor:
                                                                                slot
                                                                                    .settings
                                                                                    .bg_color,
                                                                        }}
                                                                    />
                                                                    {
                                                                        slot
                                                                            .settings
                                                                            .bg_color
                                                                    }
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg"
                                                        onClick={() =>
                                                            handleToggleActive(
                                                                slot,
                                                            )
                                                        }
                                                        title={
                                                            slot.is_active
                                                                ? __(
                                                                      'action.deactivate',
                                                                      'Deactivate',
                                                                  )
                                                                : __(
                                                                      'action.activate',
                                                                      'Activate',
                                                                  )
                                                        }
                                                    >
                                                        {slot.is_active ? (
                                                            <Eye className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground/60" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditOpen(slot)
                                                        }
                                                        className="h-8 gap-1.5 rounded-lg px-3 text-xs"
                                                    >
                                                        <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {__(
                                                            'action.settings',
                                                            'Settings',
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setActiveSlot(slot);
                                                            setIsDeleteOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="h-8 w-8 shrink-0 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ADD WIDGET DIALOG */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {__('dialog.add_widget_to_slot', 'Add Widget')}
                        </DialogTitle>
                        <DialogDescription>
                            {__(
                                'dialog.add_widget_desc',
                                'Assign a reusable library block or custom HTML widget to this template zone.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>
                                {__('label.widget_label', 'Admin Label / Name')}
                            </Label>
                            <Input
                                placeholder="e.g. Summer Sale Announcement"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>
                                {__('label.block_source', 'Source Content')}
                            </Label>
                            <Select
                                value={reusableBlockId}
                                onValueChange={setReusableBlockId}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        {__(
                                            'misc.custom_inline_html',
                                            'Custom HTML Code',
                                        )}
                                    </SelectItem>
                                    {reusable_blocks.map((block) => (
                                        <SelectItem
                                            key={block.id}
                                            value={String(block.id)}
                                        >
                                            {block.name} ({block.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {reusableBlockId === 'none' && (
                            <div className="space-y-1.5">
                                <Label>
                                    {__('label.custom_html', 'Raw Custom HTML')}
                                </Label>
                                <Textarea
                                    rows={5}
                                    placeholder="<div class='p-4 text-center font-bold text-red-500'>Sale 50%!</div>"
                                    value={inlineHtml}
                                    onChange={(e) =>
                                        setInlineHtml(e.target.value)
                                    }
                                    className="font-mono text-xs"
                                />
                            </div>
                        )}

                        <div className="space-y-3 border-t pt-4">
                            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                {__(
                                    'misc.display_settings',
                                    'Rendering Settings',
                                )}
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>
                                        {__(
                                            'label.bg_color',
                                            'Background Color',
                                        )}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            className="h-9 w-10 border p-0.5"
                                            value={
                                                settings.bg_color ?? '#ffffff'
                                            }
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    bg_color: e.target.value,
                                                })
                                            }
                                        />
                                        <Input
                                            placeholder="#ffffff"
                                            className="flex-1"
                                            value={settings.bg_color ?? ''}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    bg_color:
                                                        e.target.value || null,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>
                                        {__('label.padding', 'Padding')}
                                    </Label>
                                    <Select
                                        value={settings.padding ?? 'sm'}
                                        onValueChange={(val) =>
                                            setSettings({
                                                ...settings,
                                                padding:
                                                    val as SlotSettings['padding'],
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                None
                                            </SelectItem>
                                            <SelectItem value="sm">
                                                Small
                                            </SelectItem>
                                            <SelectItem value="md">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="lg">
                                                Large
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                        {__(
                                            'label.full_width',
                                            'Full Width Stretch',
                                        )}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {__(
                                            'misc.full_width_desc',
                                            'Bleed edge-to-edge ignoring container margins.',
                                        )}
                                    </p>
                                </div>
                                <Switch
                                    checked={!!settings.full_width}
                                    onCheckedChange={(checked) =>
                                        setSettings({
                                            ...settings,
                                            full_width: checked,
                                        })
                                    }
                                />
                            </div>

                            {selectedLocation === 'announcement_bar' && (
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">
                                            {__(
                                                'label.dismissible',
                                                'User Dismissible',
                                            )}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {__(
                                                'misc.dismissible_desc',
                                                'Allow user to click (X) to hide this widget.',
                                            )}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={!!settings.dismissible}
                                        onCheckedChange={(checked) =>
                                            setSettings({
                                                ...settings,
                                                dismissible: checked,
                                            })
                                        }
                                    />
                                </div>
                            )}

                            {(selectedLocation === 'sticky_cta' ||
                                selectedLocation === 'support_panel') && (
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">
                                            {__(
                                                'label.sticky',
                                                'Fixed / Sticky Positioning',
                                            )}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {__(
                                                'misc.sticky_desc',
                                                'Keep widget pinned at viewport boundaries.',
                                            )}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={!!settings.sticky}
                                        onCheckedChange={(checked) =>
                                            setSettings({
                                                ...settings,
                                                sticky: checked,
                                            })
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAddOpen(false)}
                        >
                            {__('action.cancel', 'Cancel')}
                        </Button>
                        <Button
                            onClick={handleCreateSlot}
                            disabled={!label.trim()}
                        >
                            {__('action.add', 'Create Widget')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT WIDGET SETTINGS DIALOG */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {__(
                                'dialog.edit_widget_settings',
                                'Widget Settings',
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {__(
                                'dialog.edit_widget_desc',
                                'Customize the layout and rendering details for this specific widget slot.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>
                                {__('label.widget_label', 'Admin Label / Name')}
                            </Label>
                            <Input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>
                                {__('label.block_source', 'Source Content')}
                            </Label>
                            <Select
                                value={reusableBlockId}
                                onValueChange={setReusableBlockId}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">
                                        {__(
                                            'misc.custom_inline_html',
                                            'Custom HTML Code',
                                        )}
                                    </SelectItem>
                                    {reusable_blocks.map((block) => (
                                        <SelectItem
                                            key={block.id}
                                            value={String(block.id)}
                                        >
                                            {block.name} ({block.type})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {reusableBlockId === 'none' && (
                            <div className="space-y-1.5">
                                <Label>
                                    {__('label.custom_html', 'Raw Custom HTML')}
                                </Label>
                                <Textarea
                                    rows={5}
                                    value={inlineHtml}
                                    onChange={(e) =>
                                        setInlineHtml(e.target.value)
                                    }
                                    className="font-mono text-xs"
                                />
                            </div>
                        )}

                        <div className="space-y-3 border-t pt-4">
                            <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                {__(
                                    'misc.display_settings',
                                    'Rendering Settings',
                                )}
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>
                                        {__(
                                            'label.bg_color',
                                            'Background Color',
                                        )}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            className="h-9 w-10 border p-0.5"
                                            value={
                                                settings.bg_color ?? '#ffffff'
                                            }
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    bg_color: e.target.value,
                                                })
                                            }
                                        />
                                        <Input
                                            placeholder="#ffffff"
                                            className="flex-1"
                                            value={settings.bg_color ?? ''}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    bg_color:
                                                        e.target.value || null,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>
                                        {__('label.padding', 'Padding')}
                                    </Label>
                                    <Select
                                        value={settings.padding ?? 'sm'}
                                        onValueChange={(val) =>
                                            setSettings({
                                                ...settings,
                                                padding:
                                                    val as SlotSettings['padding'],
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                None
                                            </SelectItem>
                                            <SelectItem value="sm">
                                                Small
                                            </SelectItem>
                                            <SelectItem value="md">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="lg">
                                                Large
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">
                                        {__(
                                            'label.full_width',
                                            'Full Width Stretch',
                                        )}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {__(
                                            'misc.full_width_desc',
                                            'Bleed edge-to-edge ignoring container margins.',
                                        )}
                                    </p>
                                </div>
                                <Switch
                                    checked={!!settings.full_width}
                                    onCheckedChange={(checked) =>
                                        setSettings({
                                            ...settings,
                                            full_width: checked,
                                        })
                                    }
                                />
                            </div>

                            {selectedLocation === 'announcement_bar' && (
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">
                                            {__(
                                                'label.dismissible',
                                                'User Dismissible',
                                            )}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {__(
                                                'misc.dismissible_desc',
                                                'Allow user to click (X) to hide this widget.',
                                            )}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={!!settings.dismissible}
                                        onCheckedChange={(checked) =>
                                            setSettings({
                                                ...settings,
                                                dismissible: checked,
                                            })
                                        }
                                    />
                                </div>
                            )}

                            {(selectedLocation === 'sticky_cta' ||
                                selectedLocation === 'support_panel') && (
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">
                                            {__(
                                                'label.sticky',
                                                'Fixed / Sticky Positioning',
                                            )}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {__(
                                                'misc.sticky_desc',
                                                'Keep widget pinned at viewport boundaries.',
                                            )}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={!!settings.sticky}
                                        onCheckedChange={(checked) =>
                                            setSettings({
                                                ...settings,
                                                sticky: checked,
                                            })
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditOpen(false)}
                        >
                            {__('action.cancel', 'Cancel')}
                        </Button>
                        <Button
                            onClick={handleUpdateSlot}
                            disabled={!label.trim()}
                        >
                            {__('action.save_changes', 'Save Changes')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE WIDGET CONFIRM DIALOG */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {__('dialog.delete_widget_title', 'Delete Widget?')}
                        </DialogTitle>
                        <DialogDescription>
                            {__(
                                'dialog.delete_widget_desc',
                                'Are you sure you want to remove this widget from the theme layout? This cannot be undone.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 text-center text-sm font-semibold">
                        "{activeSlot?.label}"
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                        >
                            {__('action.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteSlot}
                        >
                            {__('action.delete', 'Remove Widget')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
