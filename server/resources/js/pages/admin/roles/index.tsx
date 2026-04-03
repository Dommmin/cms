import { Head, Link } from '@inertiajs/react';
import * as RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import { PageHeader } from '@/components/page-header';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    users_count: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: RoleController.index.url(),
    },
];

export default function Index({ roles }: { roles: Role[] }) {
    const __ = useTranslation();

    const roleLabels: Record<string, string> = {
        'super-admin': 'Super Admin',
        admin: 'Admin',
        manager: 'Manager',
        editor: 'Editor',
        support: 'Support',
        viewer: 'Viewer',
        customer: 'Customer',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />

            <Wrapper>
                <PageHeader
                    title={__('page.roles', 'Roles & Permissions')}
                    description={__(
                        'page.roles_desc',
                        'Manage user roles and their permissions',
                    )}
                />

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {__('label.role', 'Role')}
                                </TableHead>
                                <TableHead>
                                    {__('label.permissions', 'Permissions')}
                                </TableHead>
                                <TableHead>
                                    {__('label.users', 'Users')}
                                </TableHead>
                                <TableHead className="w-[100px]">
                                    {__('label.actions', 'Actions')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">
                                        {roleLabels[role.name] ?? role.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions
                                                .slice(0, 5)
                                                .map((permission) => (
                                                    <span
                                                        key={permission.id}
                                                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
                                                    >
                                                        {permission.name}
                                                    </span>
                                                ))}
                                            {role.permissions.length > 5 && (
                                                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                    +
                                                    {role.permissions.length -
                                                        5}{' '}
                                                    more
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{role.users_count}</TableCell>
                                    <TableCell>
                                        {role.name !== 'super-admin' && (
                                            <Link
                                                href={RoleController.edit.url(
                                                    role.id,
                                                )}
                                                className="text-primary hover:underline"
                                            >
                                                {__('action.edit', 'Edit')}
                                            </Link>
                                        )}
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
