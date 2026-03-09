import { Form, Head, router } from '@inertiajs/react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
    {
        title: 'Create User',
        href: '/admin/users/create',
    },
];

export default function Create({
    roles = [],
}: {
    roles?: { id: number; name: string }[];
}) {
    const formId = 'create-user-form';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />

            <Wrapper>
                <PageHeader
                    title="Create User"
                    description="Create a new user account"
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() => router.visit('/admin/users')}
                        >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Users
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <Form
                    id={formId}
                    action="/admin/users"
                    method="post"
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
                                    autoFocus
                                    placeholder="Full name"
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
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    placeholder="Confirm password"
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
                                submitLabel="Create User"
                                processingLabel="Creating..."
                            />
                        </>
                    )}
                </Form>
            </Wrapper>
        </AppLayout>
    );
}
