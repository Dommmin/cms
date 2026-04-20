import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as RoleController from '@/actions/App/Http/Controllers/Admin/RoleController';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import StickyFormActions from '@/components/sticky-form-actions';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Permission {
    id: number;
    name: string;
    action: string;
}

interface GroupedPermission {
    resource: string;
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: RoleController.index.url() },
    { title: 'New Role', href: RoleController.create.url() },
];

export default function Create({
    groupedPermissions,
}: {
    groupedPermissions: GroupedPermission[];
}) {
    const __ = useTranslation();

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        permissions: number[];
    }>({
        name: '',
        permissions: [],
    });

    const handlePermissionToggle = (permissionId: number, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionId]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((id) => id !== permissionId),
            );
        }
    };

    const handleResourceToggle = (
        resourcePermissions: Permission[],
        checked: boolean,
    ) => {
        const permissionIds = resourcePermissions.map((p) => p.id);
        if (checked) {
            setData(
                'permissions',
                Array.from(new Set([...data.permissions, ...permissionIds])),
            );
        } else {
            setData(
                'permissions',
                data.permissions.filter((id) => !permissionIds.includes(id)),
            );
        }
    };

    const hasAllResourcePermissions = (resourcePermissions: Permission[]) =>
        resourcePermissions.every((p) => data.permissions.includes(p.id));

    const formId = 'create-role-form';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(RoleController.store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <Wrapper>
                <PageHeader
                    title="Create Role"
                    description="Define a new custom role with selective permissions"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={RoleController.index.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                {__('action.back', 'Back')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form id={formId} onSubmit={handleSubmit} className="space-y-6">
                    {/* Role name */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Name</CardTitle>
                            <CardDescription>
                                Choose a unique identifier for this role (e.g.
                                "content-manager")
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-sm space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g. content-manager"
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions */}
                    {groupedPermissions.map((group) => (
                        <Card key={group.resource}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="capitalize">
                                            {group.resource}
                                        </CardTitle>
                                        <CardDescription>
                                            {group.permissions.length}{' '}
                                            permission(s)
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`resource-${group.resource}`}
                                            checked={hasAllResourcePermissions(
                                                group.permissions,
                                            )}
                                            onCheckedChange={(checked) =>
                                                handleResourceToggle(
                                                    group.permissions,
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={`resource-${group.resource}`}
                                            className="cursor-pointer text-sm font-normal"
                                        >
                                            Select all
                                        </Label>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                    {group.permissions.map((permission) => (
                                        <div
                                            key={permission.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={data.permissions.includes(
                                                    permission.id,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handlePermissionToggle(
                                                        permission.id,
                                                        checked as boolean,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`permission-${permission.id}`}
                                                className="cursor-pointer text-sm font-normal capitalize"
                                            >
                                                {permission.action}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {errors.permissions && (
                        <p className="text-sm text-destructive">
                            {errors.permissions}
                        </p>
                    )}

                    <StickyFormActions
                        formId={formId}
                        processing={processing}
                        submitLabel="Create Role"
                    />
                </form>
            </Wrapper>
        </AppLayout>
    );
}
