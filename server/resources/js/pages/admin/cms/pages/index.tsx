import { Head, router } from '@inertiajs/react';
import { FileTextIcon } from 'lucide-react';
import { pageColumns, type PageRow } from '@/components/columns/page-columns';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';

type PagesData = {
    data: PageRow[];
    prev_page_url?: string | null;
    next_page_url?: string | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pages',
        href: '/admin/cms/pages',
    },
];

export default function Index({
    pages,
    filters,
}: {
    pages: PagesData;
    filters: { search?: string };
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pages" />

            <Wrapper>
                <PageHeader
                    title="Pages"
                    description="Manage CMS pages and content"
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit('/admin/cms/pages/create')
                            }
                        >
                            <FileTextIcon className="mr-2 h-4 w-4" />
                            Create Page
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={pageColumns}
                    data={pages.data}
                    pagination={{
                        current_page: pages.current_page,
                        last_page: pages.last_page,
                        per_page: pages.per_page,
                        total: pages.total,
                        prev_page_url: pages.prev_page_url ?? null,
                        next_page_url: pages.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search by title or slug..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/cms/pages"
                />
            </Wrapper>
        </AppLayout>
    );
}
