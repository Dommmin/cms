import { Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, TrashIcon, UserIcon } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { User } from '@/types/auth';

export const userColumns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
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
        header: 'Email',
    },
    {
        accessorKey: 'roles',
        header: 'Roles',
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
                {row.original.roles && row.original.roles.length > 0 ? (
                    row.original.roles.map((role: { name: string }) => (
                        <Badge
                            key={role.name}
                            variant="secondary"
                            className="text-xs"
                        >
                            {role.name}
                        </Badge>
                    ))
                ) : (
                    <span className="text-xs text-muted-foreground">
                        No roles
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
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/users/${row.original.id}/edit`} prefetch cacheFor={30}>
                        <PencilIcon className="mr-1 h-3 w-3" />
                        Edit
                    </Link>
                </Button>
                <ConfirmButton
                    variant="destructive"
                    size="sm"
                    title="Delete User"
                    description={`Are you sure you want to delete "${row.original.name}"? This action cannot be undone.`}
                    onConfirm={() => {
                        router.delete(`/admin/users/${row.original.id}`);
                    }}
                >
                    <TrashIcon className="mr-1 h-3 w-3" />
                    Delete
                </ConfirmButton>
            </div>
        ),
    },
];
