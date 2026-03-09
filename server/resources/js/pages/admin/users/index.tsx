import { Head, router } from '@inertiajs/react';
import { Trash2Icon, UserIcon } from 'lucide-react';
import { userColumns } from '@/components/columns/user-columns';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <Wrapper>
                <PageHeader
                    title="Users"
                    description="Manage panel users and their roles"
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() => router.visit('/admin/users/trashed')}
                        >
                            <Trash2Icon className="mr-2 h-4 w-4" />
                            Trash
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.visit('/admin/users/create')}
                        >
                            <UserIcon className="mr-2 h-4 w-4" />
                            Create User
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
                    searchPlaceholder="Search by name or email..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/users"
                />
            </Wrapper>
        </AppLayout>
    );
}
