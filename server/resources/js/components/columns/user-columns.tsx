import { Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, TrashIcon, UserIcon } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

import type { User } from '@/types/auth';

export function useUserColumns(): ColumnDef<User>[] {
    const __ = useTranslation();

    return [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: __('column.email', 'Email'),
        },
        {
            accessorKey: 'roles',
            header: __('column.roles', 'Roles'),
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.roles && row.original.roles.length > 0 ? (
                        row.original.roles.map((role: { name: string }) => (
                            <Badge
                                key={role.name}
                                variant="outline"
                                className="text-xs"
                            >
                                {role.name}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            {__('empty.no_roles', 'No roles')}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'email_verified_at',
            header: 'Verified',
            cell: ({ row }) =>
                row.original.email_verified_at ? (
                    <Badge variant="outline" className="text-xs text-green-600">
                        Yes
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                    >
                        No
                    </Badge>
                ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/users/${row.original.id}/edit`} prefetch cacheFor={30}>
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete User')}
                        description={`${__('dialog.are_you_sure', 'Are you sure?')} ${__('dialog.cannot_be_undone', 'This action cannot be undone.')}`}
                        onConfirm={() => {
                            router.delete(`/admin/users/${row.original.id}`);
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                        {__('action.delete', 'Delete')}
                    </ConfirmButton>
                </div>
            ),
        },
    ];
}

/** @deprecated Use useUserColumns() hook instead */
export const userColumns: ColumnDef<User>[] = [];
