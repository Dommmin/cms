import { Link, Form, Head, router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { User } from '@/types/auth';

export default function Edit({
    user,
    roles = [],
}: {
    user: User;
    roles?: { id: number; name: string }[];
}) {
    const formId = `edit-user-form-${user.id}`;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: '/admin/users',
        },
        {
            title: 'Edit User',
            href: `/admin/users/${user.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <Wrapper>
                <PageHeader
                    title="Edit User"
                    description={`Update details for ${user.name}`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                <Link href='/admin/users' prefetch cacheFor={30}>
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Users
                        
                </Link>
            </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    id={formId}
                    action={`/admin/users/${user.id}`}
                    method="put"
                    options={{ preserveScroll: true }}
                    className="max-w-xl space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={user.name}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    defaultValue={user.email}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">New password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Leave blank to keep current"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm new password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Confirm new password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            {roles.length > 0 && (
                                <div className="grid gap-2">
                                    <Label htmlFor="roles">Roles</Label>
                                    <div className="space-y-2">
                                        {roles.map((role) => (
                                            <div
                                                key={role.id}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`role-${role.id}`}
                                                    name="roles[]"
                                                    value={role.id}
                                                    defaultChecked={user.roles?.some(
                                                        (r) =>
                                                            r.name ===
                                                            role.name,
                                                    )}
                                                    className="h-4 w-4 rounded border-input"
                                                />
                                                <Label
                                                    htmlFor={`role-${role.id}`}
                                                    className="font-normal"
                                                >
                                                    {role.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    <InputError message={errors.roles} />
                                </div>
                            )}

                            <StickyFormActions
                                formId={formId}
                                processing={processing}
                                submitLabel="Save Changes"
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
