import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import * as SearchSynonymController from '@/actions/App/Http/Controllers/Admin/SearchSynonymController';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { SearchSynonym } from './synonyms.types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Search Synonyms', href: '' }];

export default function SynonymsIndex({
    synonyms,
}: {
    synonyms: SearchSynonym[];
}) {
    const columns: ColumnDef<SearchSynonym>[] = [
        {
            accessorKey: 'term',
            header: 'Term',
            cell: ({ row }) => (
                <span className="font-medium">{row.original.term}</span>
            ),
        },
        {
            accessorKey: 'synonyms',
            header: 'Synonyms',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.synonyms.map((s) => (
                        <Badge key={s} variant="secondary">
                            {s}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'outline'}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link
                            href={SearchSynonymController.edit.url(
                                row.original.id,
                            )}
                        >
                            Edit
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        <Trash2Icon className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this synonym?')) return;
        router.delete(SearchSynonymController.destroy.url(id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Search Synonyms" />
            <Wrapper>
                <PageHeader
                    title="Search Synonyms"
                    description="Manage synonym groups to improve search relevance."
                >
                    <PageHeaderActions compact>
                        <Button asChild>
                            <Link href={SearchSynonymController.create.url()}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Synonym
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    data={synonyms}
                    columns={columns}
                    mobilePrimaryColumns={2}
                    mobileCardTitle={(row) => (
                        <span className="font-medium">{row.term}</span>
                    )}
                    mobileEmptyLabel="No synonyms yet. Add one to improve search."
                />
            </Wrapper>
        </AppLayout>
    );
}
