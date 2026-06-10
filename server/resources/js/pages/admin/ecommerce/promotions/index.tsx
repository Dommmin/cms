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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Promotions', href: PromotionController.index.url() },
];

const promotionTypes = {
    percentage: 'Procentowy',
    fixed_amount: 'Kwota stała',
    buy_x_get_y: 'Kup X weź Y',
    free_shipping: 'Darmowa dostawa',
};

const applyToTypes = {
    all: 'Wszystkie produkty',
    specific_products: 'Wybrane produkty',
    specific_categories: 'Wybrane kategorie',
};

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
        if (confirm('Czy na pewno chcesz usunąć tę promocję?')) {
            router.delete(PromotionController.destroy.url(id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promotions" />

            <Wrapper>
                <PageHeader
                    title="Promocje Produktowe"
                    description="Zarządzaj promocjami na produkty i kategorie"
                >
                    <PageHeaderActions compact>
                        <Button asChild>
                            <Link href={PromotionController.create.url()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Dodaj Promocję
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <ListFilters
                    activeCount={activeFilterCount}
                    description="Filtruj promocje po nazwie, statusie i typie."
                    contentClassName="sm:grid sm:grid-cols-3 sm:items-end sm:gap-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="search">Szukaj</Label>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Szukaj promocji..."
                                value={filters.search || ''}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="is_active">Status</Label>
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
                                <SelectValue placeholder="Wybierz status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Wszystkie</SelectItem>
                                <SelectItem value="1">Aktywne</SelectItem>
                                <SelectItem value="0">Nieaktywne</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Typ</Label>
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
                                <SelectValue placeholder="Wybierz typ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Wszystkie</SelectItem>
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
                                                    Typ
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
                                                    Zastosowanie
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
                                                    Wartość
                                                </dt>
                                                <dd>
                                                    {promotion.type ===
                                                    'free_shipping' ? (
                                                        <span>
                                                            Darmowa dostawa
                                                        </span>
                                                    ) : promotion.type ===
                                                      'percentage' ? (
                                                        <span>
                                                            {promotion.value}%
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            {promotion.value} zł
                                                        </span>
                                                    )}
                                                </dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    Status
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
                                                            ? 'Aktywna'
                                                            : 'Nieaktywna'}
                                                    </Badge>
                                                </dd>
                                            </div>
                                            <div className="space-y-1">
                                                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                    Priorytet
                                                </dt>
                                                <dd>{promotion.priority}</dd>
                                            </div>
                                            {(promotion.starts_at ||
                                                promotion.ends_at) && (
                                                <div className="space-y-1">
                                                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                        Daty
                                                    </dt>
                                                    <dd className="space-y-1">
                                                        {promotion.starts_at && (
                                                            <div>
                                                                Od:{' '}
                                                                {new Date(
                                                                    promotion.starts_at,
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                        {promotion.ends_at && (
                                                            <div>
                                                                Do:{' '}
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
                                            Nazwa
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Typ
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Zastosowanie
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Wartość
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Status
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Priorytet
                                        </th>
                                        <th className="p-4 text-left font-medium">
                                            Data
                                        </th>
                                        <th className="p-4 text-right font-medium">
                                            Akcje
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
                                                    <span>Darmowa dostawa</span>
                                                ) : promotion.type ===
                                                  'percentage' ? (
                                                    <span>
                                                        {promotion.value}%
                                                    </span>
                                                ) : (
                                                    <span>
                                                        {promotion.value} zł
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
                                                        ? 'Aktywna'
                                                        : 'Nieaktywna'}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                {promotion.priority}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    {promotion.starts_at && (
                                                        <div>
                                                            Od:{' '}
                                                            {new Date(
                                                                promotion.starts_at,
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {promotion.ends_at && (
                                                        <div>
                                                            Do:{' '}
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
                            Pokazano {promotions.meta.from} do{' '}
                            {promotions.meta.to} z {promotions.meta.total}{' '}
                            promocji
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
