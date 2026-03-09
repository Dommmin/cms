import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Promotion {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
    value: number | null;
    min_value: number | null;
    max_discount: number | null;
    apply_to: 'all' | 'specific_products' | 'specific_categories';
    is_active: boolean;
    is_stackable: boolean;
    priority: number;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    products: Array<{ id: number; name: string }>;
    categories: Array<{ id: number; name: string }>;
}

interface PaginatedPromotions {
    data: Promotion[];
    links: any;
    meta: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Promotions', href: '/admin/ecommerce/promotions' },
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
    const handleSearch = (value: string) => {
        router.get(
            '/admin/ecommerce/promotions',
            { ...filters, search: value },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/admin/ecommerce/promotions',
            { ...filters, [key]: value },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const togglePromotion = (id: number) => {
        router.post(
            `/admin/ecommerce/promotions/${id}/toggle`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const deletePromotion = (id: number) => {
        if (confirm('Czy na pewno chcesz usunąć tę promocję?')) {
            router.delete(`/admin/ecommerce/promotions/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promotions" />

            <Wrapper>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Promocje Produktowe
                        </h1>
                        <p className="text-muted-foreground">
                            Zarządzaj promocjami na produkty i kategorie
                        </p>
                    </div>
                    <Link href="/admin/ecommerce/promotions/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Dodaj Promocję
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filtry</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label htmlFor="search">Szukaj</Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Szukaj promocji..."
                                        value={filters.search || ''}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
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
                                        <SelectItem value="all">
                                            Wszystkie
                                        </SelectItem>
                                        <SelectItem value="1">
                                            Aktywne
                                        </SelectItem>
                                        <SelectItem value="0">
                                            Nieaktywne
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
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
                                        <SelectItem value="all">
                                            Wszystkie
                                        </SelectItem>
                                        {Object.entries(promotionTypes).map(
                                            ([key, label]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
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
                                                    <Link
                                                        href={`/admin/ecommerce/promotions/${promotion.id}/edit`}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
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
                            {promotions.links.map(
                                (link: any, index: number) => (
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
                                ),
                            )}
                        </div>
                    </div>
                )}
            </Wrapper>
        </AppLayout>
    );
}
