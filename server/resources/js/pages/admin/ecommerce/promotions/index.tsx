'use client';

import { Head, Link, router } from '@inertiajs/react';
import {
    PencilIcon,
    Plus,
    Power,
    PowerOff,
    Search,
    Trash2,
} from 'lucide-react';
import * as PromotionController from '@/actions/App/Http/Controllers/Admin/Ecommerce/PromotionController';
import ListFilters from '@/components/list-filters';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { PaginatedPromotions } from './index.types';

export default function Index({
    promotions,
    filters,
}: {
    promotions: PaginatedPromotions;
    filters: {
        search?: string;
        is_active?: string;
        type?: string;
    };
}) {
    const __ = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('promotions.title', 'Promotions'), href: PromotionController.index.url() },
    ];

    const promotionTypes = {
        percentage: __('promotions.type.percentage', 'Percentage'),
        fixed_amount: __('promotions.type.fixed_amount', 'Fixed amount'),
        buy_x_get_y: __('promotions.type.buy_x_get_y', 'Buy X get Y'),
        free_shipping: __('promotions.type.free_shipping', 'Free shipping'),
    };

    const applyToTypes = {
        all: __('promotions.apply_to.all', 'All products'),
        specific_products: __('promotions.apply_to.specific_products', 'Selected products'),
        specific_categories: __('promotions.apply_to.specific_categories', 'Selected categories'),
    };

    const activeFilterCount = [
        filters.search,
        filters.is_active,
        filters.type,
    ].filter(Boolean).length;

    const handleSearch = (value: string) => {
        router.get(
            PromotionController.index.url(),
            { ...filters, search: value },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            PromotionController.index.url(),
            { ...filters, [key]: value },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const togglePromotion = (id: number) => {
        router.post(
            PromotionController.toggle.url(id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const deletePromotion = (id: number) => {
        if (confirm(__('promotions.delete_confirm', 'Are you sure you want to delete this promotion?'))) {
            router.delete(PromotionController.destroy.url(id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('promotions.title', 'Promotions')} />

            <Wrapper>
                <PageHeader
                    title={__('promotions.title_heading', 'Product Promotions')}
                    description={__('promotions.description', 'Manage promotions on products and categories')}
                >
                    <PageHeaderActions compact>
                        <Button asChild>
                            <Link href={PromotionController.create.url()}>
                                <Plus className="mr-2 h-4 w-4" />
                                {__('promotions.add_button', 'Add Promotion')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <ListFilters
                    activeCount={activeFilterCount}
                    description={__('promotions.filter_description', 'Filter promotions by name, status, and type.')}
                    contentClassName="sm:grid sm:grid-cols-3 sm:items-end sm:gap-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="search">{__('promotions.search', 'Search')}</Label>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder={__('promotions.search_placeholder', 'Search promotions...')}
                                value={filters.search || ''}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="is_active">{__('promotions.status', 'Status')}</Label>
                        <Select
                            value={filters.is_active || 'all'}
                            onValueChange={(value) =>
                                handleFilter(
                                    'is_active',
                                    value === 'all' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={__('promotions.select_status', 'Select status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{__('promotions.all', 'All')}</SelectItem>
                                <SelectItem value="1">{__('promotions.active', 'Active')}</SelectItem>
                                <SelectItem value="0">{__('promotions.inactive', 'Inactive')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">{__('promotions.type', 'Type')}</Label>
                        <Select
                            value={filters.type || 'all'}
                            onValueChange={(value) =>
                                handleFilter(
                                    'type',
                                    value === 'all' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={__('promotions.select_type', 'Select type')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{__('promotions.all', 'All')}</SelectItem>
                                {Object.entries(promotionTypes).map(
                                    ([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </ListFilters>

                <Card>
                    <CardContent className="p-0">
                        <div className="space-y-3 p-4 md:hidden">
                            {promotions.data.map((promotion) => (
                                <Card key={promotion.id}>
                                    <CardContent className="space-y-4 p-4">
                                        <div className="space-y-2">
                                            <div className="font-medium">
                                                {promotion.name}
                                            </div>
                                            {promotion.description && (
                                                <div className="text-sm text-muted-foreground">
                                                    {promotion.description}
                                                </div>
                                            )}
                                        </div>

                                        <dl className="space-y-2 text-sm">
                                            <div className="space-y-1">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    {__('promotions.type', 'Type')}
                                                </dt>
                                                <dd>
                                                    <Badge variant="outline">
                                                        {
                                                            promotionTypes[
                                                                promotion.type
                                                            ]
                                                        }
                                                    </Badge>
                                                </dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    {__('promotions.apply_to', 'Apply to')}
                                                </dt>
                                                <dd>
                                                    <Badge variant="secondary">
                                                        {
                                                            applyToTypes[
                                                                promotion
                                                                    .apply_to
                                                            ]
                                                        }
                                                    </Badge>
                                                </dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    {__('promotions.value', 'Value')}
                                                </dt>
                                                <dd>
                                                    {promotion.type ===
                                                    'free_shipping' ? (
                                                        <span>
                                                            {__('promotions.free_shipping', 'Free shipping')}
                                                        </span>
                                                    ) : promotion.type ===
                                                      'percentage' ? (
                                                        <span>
                                                            {promotion.value}%
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            {promotion.value} {__('promotions.currency_symbol', 'zł')}
                                                        </span>
                                                    )}
                                                </dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    {__('promotions.status', 'Status')}
                                                </dt>
                                                <dd>
                                                    <Badge
                                                        variant={
                                                            promotion.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {promotion.is_active
                                                            ? __('promotions.active', 'Active')
                                                            : __('promotions.inactive', 'Inactive')}
                                                    </Badge>
                                                </dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    {__('promotions.priority', 'Priority')}
                                                </dt>
                                                <dd>{promotion.priority}</dd>
                                            </div>
                                            {(promotion.starts_at ||
                                                promotion.ends_at) && (
                                                <div className="space-y-1">
                                                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                        {__('promotions.dates', 'Dates')}
                                                    </dt>
                                                    <dd className="space-y-1">
                                                        {promotion.starts_at && (
                                                            <div>
                                                                {__('promotions.date_from', 'From:')}{' '}
                                                                {new Date(
                                                                    promotion.starts_at,
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                        {promotion.ends_at && (
                                                            <div>
                                                                {__('promotions.date_to', 'To:')}{' '}
                                                                {new Date(
                                                                    promotion.ends_at,
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </dd>
                                                </div>
                                            )}
                                        </dl>

                                        <div className="grid grid-cols-3 gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    togglePromotion(
                                                        promotion.id,
                                                    )
                                                }
                                            >
                                                {promotion.is_active ? (
                                                    <PowerOff className="h-4 w-4" />
                                                ) : (
                                                    <Power className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Link
                                                    href={PromotionController.edit.url(
                                                        promotion.id,
                                                    )}
                                                    prefetch
                                                    cacheFor={30}
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    deletePromotion(
                                                        promotion.id,
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-4 text-left font-medium">
                                            {__('promotions.name', 'Name')}
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            {__('promotions.type', 'Type')}
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            {__('promotions.apply_to', 'Apply to')}
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            {__('promotions.value', 'Value')}
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            {__('promotions.status', 'Status')}
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            {__('promotions.priority', 'Priority')}
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            {__('promotions.date', 'Date')}
                                        </th>
                                        <th className="p-4 text-right font-medium">
                                            {__('promotions.actions', 'Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promotions.data.map((promotion) => (
                                        <tr
                                            key={promotion.id}
                                            className="border-b"
                                        >
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-medium">
                                                        {promotion.name}
                                                    </div>
                                                    {promotion.description && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {
                                                                promotion.description
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline">
                                                    {
                                                        promotionTypes[
                                                            promotion.type
                                                        ]
                                                    }
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="secondary">
                                                    {
                                                        applyToTypes[
                                                            promotion.apply_to
                                                        ]
                                                    }
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                {promotion.type ===
                                                'free_shipping' ? (
                                                    <span>{__('promotions.free_shipping', 'Free shipping')}</span>
                                                ) : promotion.type ===
                                                  'percentage' ? (
                                                    <span>
                                                        {promotion.value}%
                                                    </span>
                                                ) : (
                                                    <span>
                                                        {promotion.value} {__('promotions.currency_symbol', 'zł')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant={
                                                        promotion.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {promotion.is_active
                                                        ? __('promotions.active', 'Active')
                                                        : __('promotions.inactive', 'Inactive')}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                {promotion.priority}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    {promotion.starts_at && (
                                                        <div>
                                                            {__('promotions.date_from', 'From:')}{' '}
                                                            {new Date(
                                                                promotion.starts_at,
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {promotion.ends_at && (
                                                        <div>
                                                            {__('promotions.date_to', 'To:')}{' '}
                                                            {new Date(
                                                                promotion.ends_at,
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            togglePromotion(
                                                                promotion.id,
                                                            )
                                                        }
                                                    >
                                                        {promotion.is_active ? (
                                                            <PowerOff className="h-4 w-4" />
                                                        ) : (
                                                            <Power className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={PromotionController.edit.url(
                                                                promotion.id,
                                                            )}
                                                            prefetch
                                                            cacheFor={30}
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            deletePromotion(
                                                                promotion.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {promotions.links && promotions.meta && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            {__('promotions.pagination_showing', {
                                from: promotions.meta.from,
                                to: promotions.meta.to,
                                total: promotions.meta.total,
                            }, 'Showing :from to :to of :total promotions')}
                        </div>
                        <div className="flex gap-2">
                            {promotions.links.map((link, index: number) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`rounded-md px-3 py-2 text-sm ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : link.url
                                              ? 'bg-muted hover:bg-muted/80'
                                              : 'cursor-not-allowed bg-muted text-muted-foreground'
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </Wrapper>
        </AppLayout>
    );
}
