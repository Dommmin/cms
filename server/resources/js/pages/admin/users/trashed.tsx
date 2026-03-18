import { Form, Head, Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import {
    forceDelete,
    restore,
} from '@/actions/App/Http/Controllers/Admin/UserController';

import type { BreadcrumbItem } from '@/types';

type TrashedUser = {
    id: number;
    name: string;
    email: string;
    deleted_at: string;
};

type PaginatedUsers = {
    data: TrashedUser[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url?: string | null;
    next_page_url?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/admin/users' },
    { title: 'Trash', href: '/admin/users/trashed' },
];

export default function Trashed({ users }: { users: PaginatedUsers }) {
    const [confirmUserId, setConfirmUserId] = useState<number | null>(null);
    const confirmUser = users.data.find((u) => u.id === confirmUserId);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Deleted Users" />

            <Wrapper>
                <PageHeader
                    title="Deleted Users"
                    description="Soft-deleted accounts — restore or permanently remove"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/users" prefetch cacheFor={30}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back to Users
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                {users.data.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        No deleted users found.
                    </p>
                ) : (
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Deleted At
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-3">
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(
                                                user.deleted_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Form
                                                    {...restore.form(user.id)}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={
                                                                processing
                                                            }
                                                        >
                                                            <RotateCcwIcon className="mr-1 h-3 w-3" />
                                                            Restore
                                                        </Button>
                                                    )}
                                                </Form>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setConfirmUserId(
                                                            user.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2Icon className="mr-1 h-3 w-3" />
                                                    Delete Permanently
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {users.last_page > 1 && (
                    <div className="mt-4 flex items-center gap-2">
                        {users.prev_page_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.visit(users.prev_page_url!)
                                }
                            >
                                Previous
                            </Button>
                        )}
                        <span className="text-muted-foreground text-sm">
                            Page {users.current_page} of {users.last_page}
                        </span>
                        {users.next_page_url && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.visit(users.next_page_url!)
                                }
                            >
                                Next
                            </Button>
                        )}
                    </div>
                )}
            </Wrapper>

            <Dialog
                open={confirmUserId !== null}
                onOpenChange={(open) => !open && setConfirmUserId(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Permanently Delete User</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The user{' '}
                            <strong>{confirmUser?.name}</strong> will be
                            permanently removed from the database.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmUserId(null)}
                        >
                            Cancel
                        </Button>
                        <Form {...forceDelete.form(confirmUserId ?? 0)}>
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="outline"
                                    disabled={processing}
                                    onClick={() => setConfirmUserId(null)}
                                >
                                    Delete Permanently
                                </Button>
                            )}
                        </Form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
