import { Link, Head, router } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    GripVerticalIcon,
    PlusIcon,
    TrashIcon,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalizedInput } from '@/components/ui/localized-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type MenuItemData = {
    id?: number;
    label: Record<string, string>;
    url: string;
    target: string;
    icon: string;
    children: MenuItemData[];
};

type Menu = {
    id: number;
    name: string;
    location: string | null;
    is_active: boolean;
    items: MenuItemData[];
};

type Props = {
    menu: Menu;
    locations: { value: string; label: string }[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menus', href: '/admin/menus' },
    { title: 'Edit', href: '' },
];

function emptyItem(): MenuItemData {
    return { label: {}, url: '', target: '_self', icon: '', children: [] };
}

function MenuItemEditor({
    item,
    onChange,
    onDelete,
    onAddChild,
    depth = 0,
}: {
    item: MenuItemData;
    onChange: (patch: Partial<MenuItemData>) => void;
    onDelete: () => void;
    onAddChild: () => void;
    depth?: number;
}) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = item.children.length > 0;

    return (
        <div className={depth > 0 ? 'ml-6 border-l pl-4' : ''}>
            <div className="rounded-lg border bg-card p-4">
                <div className="flex items-start gap-3">
                    <GripVerticalIcon className="mt-2 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />

                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <LocalizedInput
                                label="Label"
                                value={item.label}
                                onChange={(v) => onChange({ label: v })}
                                placeholder="e.g. Home"
                                required
                            />
                            <div className="grid gap-1">
                                <Label className="text-xs text-muted-foreground">
                                    URL
                                </Label>
                                <Input
                                    value={item.url}
                                    onChange={(e) =>
                                        onChange({ url: e.target.value })
                                    }
                                    placeholder="/home or https://..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1">
                                <Label className="text-xs text-muted-foreground">
                                    Target
                                </Label>
                                <Select
                                    value={item.target}
                                    onValueChange={(v) =>
                                        onChange({ target: v })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_self">
                                            Same window
                                        </SelectItem>
                                        <SelectItem value="_blank">
                                            New window
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs text-muted-foreground">
                                    Icon (optional)
                                </Label>
                                <Input
                                    value={item.icon}
                                    onChange={(e) =>
                                        onChange({ icon: e.target.value })
                                    }
                                    placeholder="lucide icon name"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        {depth === 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={onAddChild}
                                title="Add sub-item"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </Button>
                        )}
                        {hasChildren && (
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => setExpanded((p) => !p)}
                                title="Toggle children"
                            >
                                {expanded ? (
                                    <ChevronDownIcon className="h-4 w-4" />
                                ) : (
                                    <ChevronRightIcon className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={onDelete}
                            className="text-destructive"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {hasChildren && expanded && (
                <div className="mt-2 space-y-2">
                    {item.children.map((child, idx) => (
                        <MenuItemEditor
                            key={idx}
                            item={child}
                            depth={depth + 1}
                            onChange={(patch) => {
                                const children = item.children.map((c, i) =>
                                    i === idx ? { ...c, ...patch } : c,
                                );
                                onChange({ children });
                            }}
                            onDelete={() => {
                                onChange({
                                    children: item.children.filter(
                                        (_, i) => i !== idx,
                                    ),
                                });
                            }}
                            onAddChild={() => {}}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Edit({ menu, locations }: Props) {
    const __ = useTranslation();

    const [name, setName] = useState(menu.name);
    const [location, setLocation] = useState(menu.location ?? 'none');
    const [isActive, setIsActive] = useState(menu.is_active);
    const normalizeLabel = (label: unknown): Record<string, string> => {
        if (typeof label === 'string') return { en: label };
        if (label && typeof label === 'object')
            return label as Record<string, string>;
        return {};
    };

    const [items, setItems] = useState<MenuItemData[]>(
        menu.items.map((item) => ({
            ...item,
            label: normalizeLabel(item.label),
            icon: item.icon ?? '',
            children: (item.children ?? []).map((c) => ({
                ...c,
                label: normalizeLabel(c.label),
                icon: c.icon ?? '',
                children: [],
            })),
        })),
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const addItem = () => setItems((prev) => [...prev, emptyItem()]);

    const updateItem = (index: number, patch: Partial<MenuItemData>) => {
        setItems((prev) =>
            prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
        );
    };

    const deleteItem = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const addChildToItem = (index: number) => {
        setItems((prev) =>
            prev.map((item, i) =>
                i === index
                    ? { ...item, children: [...item.children, emptyItem()] }
                    : item,
            ),
        );
    };

    const handleSave = () => {
        setProcessing(true);
        router.put(
            `/admin/menus/${menu.id}`,
            {
                name,
                location: location === 'none' ? null : location,
                is_active: isActive,
                items: items.map((item) => ({
                    label: item.label,
                    url: item.url,
                    target: item.target,
                    icon: item.icon || null,
                    children: item.children.map((child) => ({
                        label: child.label,
                        url: child.url,
                        target: child.target,
                        icon: child.icon || null,
                    })),
                })),
            },
            {
                onSuccess: () => {
                    toast.success('Menu saved');
                    setErrors({});
                },
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    toast.error('Please fix the errors below');
                },
                onFinish: () => setProcessing(false),
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${menu.name}`} />
            <Wrapper>
                <PageHeader
                    title={__('page.edit_menu', 'Edit Menu')}
                    description={__(
                        'page.edit_menu_desc',
                        'Manage menu items and settings',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/menus" prefetch cacheFor={30}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="space-y-6">
                    {/* Menu Settings */}
                    <div className="rounded-lg border bg-card p-6">
                        <h3 className="mb-4 font-medium">
                            {__('misc.menu_settings', 'Menu Settings')}
                        </h3>
                        <div className="grid max-w-2xl gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">
                                    {__('label.name', 'Name')} *
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Main Navigation"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="location">
                                    {__('label.location', 'Location')}
                                </Label>
                                <Select
                                    value={location}
                                    onValueChange={setLocation}
                                >
                                    <SelectTrigger id="location">
                                        <SelectValue
                                            placeholder={__(
                                                'placeholder.select_location',
                                                'Select location',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            {__(
                                                'misc.no_location',
                                                'No location',
                                            )}
                                        </SelectItem>
                                        {locations.map((loc) => (
                                            <SelectItem
                                                key={loc.value}
                                                value={loc.value}
                                            >
                                                {loc.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {__(
                                        'misc.location_hint',
                                        'Where this menu appears on the public site.',
                                    )}
                                </p>
                                <InputError message={errors.location} />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={isActive}
                                    onChange={(e) =>
                                        setIsActive(e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    {__('label.is_active', 'Active')}
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="rounded-lg border bg-card p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">
                                    {__('misc.menu_items', 'Menu Items')}
                                </h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {__(
                                        'misc.menu_items_desc',
                                        'Add links. Use the',
                                    )}{' '}
                                    <PlusIcon className="inline h-3 w-3" />{' '}
                                    {__(
                                        'misc.menu_items_desc2',
                                        'button on an item to add a sub-item (dropdown).',
                                    )}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                            >
                                <PlusIcon className="mr-1 h-4 w-4" />
                                {__('action.add_item', 'Add Item')}
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <MenuItemEditor
                                    key={index}
                                    item={item}
                                    onChange={(patch) =>
                                        updateItem(index, patch)
                                    }
                                    onDelete={() => deleteItem(index)}
                                    onAddChild={() => addChildToItem(index)}
                                />
                            ))}

                            {items.length === 0 && (
                                <div className="rounded-lg border border-dashed p-8 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'empty.no_items',
                                            'No items yet. Click "Add Item" to start building your menu.',
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={handleSave}
                            disabled={processing}
                        >
                            {processing
                                ? __('misc.saving', 'Saving...')
                                : __('action.save_menu', 'Save Menu')}
                        </Button>
                    </div>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
