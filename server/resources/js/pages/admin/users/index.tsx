import { Head, Link } from '@inertiajs/react';
import { Trash2Icon, UserIcon } from 'lucide-react';
import { useUserColumns } from '@/components/columns/user-columns';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import type { User } from '@/types/auth';

type UserData = {
    data: User[];
    prev_page_url?: string;
    next_page_url?: string;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    sort?: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
];

export default function Index({
    users,
    filters,
}: {
    users: UserData;
    filters: { search?: string; sort?: string; per_page?: number };
}) {
    const __ = useTranslation();
    const userColumns = useUserColumns();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <Wrapper>
                <PageHeader
                    title={__('page.users', 'Users')}
                    description={__(
                        'page.users_desc',
                        'Manage panel users and their roles',
                    )}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/users/trashed"
                                prefetch
                                cacheFor={30}
                            >
                                <Trash2Icon className="mr-2 h-4 w-4" />
                                {__('action.trash', 'Trash')}
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                href="/admin/users/create"
                                prefetch
                                cacheFor={30}
                            >
                                <UserIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'Create User')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={userColumns}
                    data={users.data}
                    pagination={{
                        current_page: users.current_page,
                        last_page: users.last_page,
                        per_page: users.per_page,
                        total: users.total,
                        prev_page_url: users.prev_page_url ?? null,
                        next_page_url: users.next_page_url ?? null,
                        sort: users.sort,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search_users',
                        'Search by name or email...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/users"
                />
            </Wrapper>
        </AppLayout>
    );
}
