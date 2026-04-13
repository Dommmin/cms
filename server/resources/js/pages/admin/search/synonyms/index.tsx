import { Head, Link, router } from '@inertiajs/react';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import * as SearchSynonymController from '@/actions/App/Http/Controllers/Admin/SearchSynonymController';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { SearchSynonym } from './synonyms.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Search Synonyms', href: '' },
];

export default function SynonymsIndex({
    synonyms,
}: {
    synonyms: SearchSynonym[];
}) {
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
                    <PageHeaderActions>
                        <Button asChild>
                            <Link href={SearchSynonymController.create.url()}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Synonym
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <div className="rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Term</TableHead>
                                <TableHead>Synonyms</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {synonyms.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        No synonyms yet. Add one to improve search.
                                    </TableCell>
                                </TableRow>
                            )}
                            {synonyms.map((synonym) => (
                                <TableRow key={synonym.id}>
                                    <TableCell className="font-medium">
                                        {synonym.term}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {synonym.synonyms.map((s) => (
                                                <Badge
                                                    key={s}
                                                    variant="secondary"
                                                >
                                                    {s}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                synonym.is_active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {synonym.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={SearchSynonymController.edit.url(
                                                        synonym.id,
                                                    )}
                                                >
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(synonym.id)
                                                }
                                            >
                                                <Trash2Icon className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Wrapper>
        </AppLayout>
    );
}
