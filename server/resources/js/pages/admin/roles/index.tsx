import { Head, Link, router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import * as RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
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
    is_system: boolean;
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
    const [deletingId, setDeletingId] = useState<number | null>(null);

    function handleDelete(role: Role) {
        if (!confirm(`Delete role "${role.name}"? This cannot be undone.`))
            return;
        setDeletingId(role.id);
        router.delete(RoleController.destroy.url({ id: role.id }), {
            onFinish: () => setDeletingId(null),
        });
    }

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
                >
                    <PageHeaderActions>
                        <Button asChild>
                            <Link href={RoleController.create.url()}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Role
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

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
                                <TableHead className="w-[140px]">
                                    {__('label.actions', 'Actions')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {role.name}
                                            {role.is_system && (
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    system
                                                </span>
                                            )}
                                        </div>
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
                                        <div className="flex items-center gap-2">
                                            {role.name !== 'super-admin' && (
                                                <Link
                                                    href={RoleController.edit.url(
                                                        { id: role.id },
                                                    )}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    {__('action.edit', 'Edit')}
                                                </Link>
                                            )}
                                            {!role.is_system &&
                                                role.users_count === 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                        disabled={
                                                            deletingId ===
                                                            role.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(role)
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
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
