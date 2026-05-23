import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as ThemeController from '@/actions/App/Http/Controllers/Admin/ThemeController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { EditProps } from './edit.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Themes', href: ThemeController.index.url() },
    { title: 'Edit', href: '' },
];

const editableTokens = [
    { key: 'background', label: 'Background' },
    { key: 'foreground', label: 'Foreground' },
    { key: 'primary', label: 'Primary' },
    { key: 'primary-foreground', label: 'Primary Foreground' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'secondary-foreground', label: 'Secondary Foreground' },
    { key: 'muted', label: 'Muted' },
    { key: 'muted-foreground', label: 'Muted Foreground' },
    { key: 'accent', label: 'Accent' },
    { key: 'accent-foreground', label: 'Accent Foreground' },
    { key: 'border', label: 'Border' },
    { key: 'ring', label: 'Ring' },
    { key: 'radius', label: 'Radius' },
    { key: 'sidebar', label: 'Sidebar' },
    { key: 'sidebar-foreground', label: 'Sidebar Foreground' },
    { key: 'sidebar-primary', label: 'Sidebar Primary' },
    {
        key: 'sidebar-primary-foreground',
        label: 'Sidebar Primary Foreground',
    },
    { key: 'sidebar-accent', label: 'Sidebar Accent' },
    { key: 'sidebar-accent-foreground', label: 'Sidebar Accent Foreground' },
    { key: 'sidebar-border', label: 'Sidebar Border' },
    { key: 'sidebar-ring', label: 'Sidebar Ring' },
] as const;

const fontOptions = [
    'Inter',
    'Plus Jakarta Sans',
    'DM Sans',
    'Manrope',
    'Outfit',
    'Sora',
    'Space Grotesk',
    'Geist',
    'System UI',
];

const scaleOptions = ['1.125', '1.2', '1.25', '1.333', '1.5'];

function DesignSection({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border p-4">
            <h3 className="mb-1 text-sm font-semibold">{title}</h3>
            {description && (
                <p className="mb-3 text-xs text-muted-foreground">
                    {description}
                </p>
            )}
            {children}
        </div>
    );
}

function FieldGroup({
    label,
    name,
    defaultValue,
    placeholder,
    type = 'text',
}: {
    label: string;
    name: string;
    defaultValue?: string;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                type={type}
                defaultValue={defaultValue}
                placeholder={placeholder}
            />
        </div>
    );
}

export default function Edit({ theme }: EditProps) {
    const formId = 'theme-edit-form';
    const typography = theme.typography ?? {};
    const spacing = theme.spacing ?? {};
    const buttons = theme.buttons ?? {};
    const containers = theme.containers ?? {};

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${theme.name}`} />
            <Wrapper>
                <PageHeader
                    title="Edit Theme"
                    description="Update theme settings"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={ThemeController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Themes
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="mb-4 flex items-center gap-2">
                    <Badge variant={theme.is_active ? 'default' : 'secondary'}>
                        {theme.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        Used by {theme.pages_count} pages
                    </span>
                </div>

                <Form
                    action={ThemeController.update.url(theme.id)}
                    method="post"
                    id={formId}
                    className="max-w-3xl space-y-6"
                    children={({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={theme.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    required
                                    defaultValue={theme.slug}
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={theme.description ?? ''}
                                    placeholder="Theme description..."
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <DesignSection
                                title="Colors"
                                description="Core color tokens used across the site."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    {editableTokens.map((token) => (
                                        <div
                                            key={token.key}
                                            className="grid gap-2"
                                        >
                                            <Label
                                                htmlFor={`token-${token.key}`}
                                            >
                                                {token.label}
                                            </Label>
                                            <Input
                                                id={`token-${token.key}`}
                                                name={`tokens[${token.key}]`}
                                                defaultValue={
                                                    theme.tokens?.[token.key] ??
                                                    ''
                                                }
                                                placeholder="e.g. oklch(0.205 0 0) or #111827"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.tokens} />
                            </DesignSection>

                            <DesignSection
                                title="Typography"
                                description="Font families, sizes, and type scale."
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="typography-heading_font">
                                            Heading Font
                                        </Label>
                                        <Select
                                            name="typography[heading_font]"
                                            defaultValue={
                                                typography.heading_font ||
                                                'Inter'
                                            }
                                        >
                                            <SelectTrigger id="typography-heading_font">
                                                <SelectValue placeholder="Select font" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fontOptions.map((font) => (
                                                    <SelectItem
                                                        key={font}
                                                        value={font}
                                                    >
                                                        {font}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="typography-body_font">
                                            Body Font
                                        </Label>
                                        <Select
                                            name="typography[body_font]"
                                            defaultValue={
                                                typography.body_font || 'Inter'
                                            }
                                        >
                                            <SelectTrigger id="typography-body_font">
                                                <SelectValue placeholder="Select font" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fontOptions.map((font) => (
                                                    <SelectItem
                                                        key={font}
                                                        value={font}
                                                    >
                                                        {font}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <FieldGroup
                                        label="Base Size"
                                        name="typography[base_size]"
                                        defaultValue={typography.base_size}
                                        placeholder="16px"
                                    />
                                    <div className="grid gap-2">
                                        <Label htmlFor="typography-scale">
                                            Type Scale
                                        </Label>
                                        <Select
                                            name="typography[scale]"
                                            defaultValue={
                                                typography.scale || '1.25'
                                            }
                                        >
                                            <SelectTrigger id="typography-scale">
                                                <SelectValue placeholder="Select scale" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {scaleOptions.map((s) => (
                                                    <SelectItem
                                                        key={s}
                                                        value={s}
                                                    >
                                                        {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <FieldGroup
                                        label="H1 Size"
                                        name="typography[h1_size]"
                                        defaultValue={typography.h1_size}
                                        placeholder="2.5rem"
                                    />
                                    <FieldGroup
                                        label="H2 Size"
                                        name="typography[h2_size]"
                                        defaultValue={typography.h2_size}
                                        placeholder="2rem"
                                    />
                                    <FieldGroup
                                        label="H3 Size"
                                        name="typography[h3_size]"
                                        defaultValue={typography.h3_size}
                                        placeholder="1.5rem"
                                    />
                                    <FieldGroup
                                        label="H4 Size"
                                        name="typography[h4_size]"
                                        defaultValue={typography.h4_size}
                                        placeholder="1.25rem"
                                    />
                                </div>
                            </DesignSection>

                            <DesignSection
                                title="Spacing & Layout"
                                description="Section padding, block gaps, and container widths."
                            >
                                <div className="grid gap-4 md:grid-cols-3">
                                    <FieldGroup
                                        label="Section Padding Y"
                                        name="spacing[section_padding]"
                                        defaultValue={spacing.section_padding}
                                        placeholder="5rem"
                                    />
                                    <FieldGroup
                                        label="Block Gap"
                                        name="spacing[block_gap]"
                                        defaultValue={spacing.block_gap}
                                        placeholder="2rem"
                                    />
                                    <FieldGroup
                                        label="Container Padding"
                                        name="spacing[container_padding]"
                                        defaultValue={spacing.container_padding}
                                        placeholder="1.5rem"
                                    />
                                </div>
                            </DesignSection>

                            <DesignSection
                                title="Buttons"
                                description="Button radius and padding."
                            >
                                <div className="mb-3 text-xs font-medium text-muted-foreground">
                                    Primary Button
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <FieldGroup
                                        label="Border Radius"
                                        name="buttons[primary_border_radius]"
                                        defaultValue={
                                            buttons.primary_border_radius
                                        }
                                        placeholder="0.5rem"
                                    />
                                    <FieldGroup
                                        label="Padding X"
                                        name="buttons[primary_padding_x]"
                                        defaultValue={buttons.primary_padding_x}
                                        placeholder="1.5rem"
                                    />
                                    <FieldGroup
                                        label="Padding Y"
                                        name="buttons[primary_padding_y]"
                                        defaultValue={buttons.primary_padding_y}
                                        placeholder="0.75rem"
                                    />
                                </div>
                                <div className="mt-4 mb-3 text-xs font-medium text-muted-foreground">
                                    Secondary Button
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <FieldGroup
                                        label="Border Radius"
                                        name="buttons[secondary_border_radius]"
                                        defaultValue={
                                            buttons.secondary_border_radius
                                        }
                                        placeholder="0.5rem"
                                    />
                                    <FieldGroup
                                        label="Padding X"
                                        name="buttons[secondary_padding_x]"
                                        defaultValue={
                                            buttons.secondary_padding_x
                                        }
                                        placeholder="1.5rem"
                                    />
                                    <FieldGroup
                                        label="Padding Y"
                                        name="buttons[secondary_padding_y]"
                                        defaultValue={
                                            buttons.secondary_padding_y
                                        }
                                        placeholder="0.75rem"
                                    />
                                </div>
                            </DesignSection>

                            <DesignSection
                                title="Containers"
                                description="Max widths for page layouts."
                            >
                                <div className="grid gap-4 md:grid-cols-3">
                                    <FieldGroup
                                        label="Max Width"
                                        name="containers[max_width]"
                                        defaultValue={containers.max_width}
                                        placeholder="1280px"
                                    />
                                    <FieldGroup
                                        label="Content Width"
                                        name="containers[content_width]"
                                        defaultValue={containers.content_width}
                                        placeholder="768px"
                                    />
                                    <FieldGroup
                                        label="Narrow Width"
                                        name="containers[narrow_width]"
                                        defaultValue={containers.narrow_width}
                                        placeholder="640px"
                                    />
                                </div>
                            </DesignSection>

                            <div className="flex items-center gap-2">
                                <input
                                    type="hidden"
                                    name="is_active"
                                    value="0"
                                />
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={theme.is_active}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    Active
                                </Label>
                            </div>

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel="Save Changes"
                            />
                        </>
                    )}
                />
            </Wrapper>
        </AppLayout>
    );
}
