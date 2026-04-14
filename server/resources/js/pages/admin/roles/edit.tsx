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

interface Role {
    id: number;
    name: string;
    permissions: { id: number; name: string }[];
}

const roleLabels: Record<string, string> = {
    'super-admin': 'Super Admin',
    admin: 'Admin',
    manager: 'Manager',
    editor: 'Editor',
    support: 'Support',
    viewer: 'Viewer',
    customer: 'Customer',
};

export default function Edit({
    role,
    groupedPermissions,
}: {
    role: Role;
    groupedPermissions: GroupedPermission[];
}) {
    const __ = useTranslation();

    const formId = `edit-role-form-${role.id}`;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles',
            href: RoleController.index.url(),
        },
        {
            title: 'Edit Role',
            href: RoleController.edit.url({ id: role.id }),
        },
    ];

    const rolePermissions = role.permissions.map((p) => p.id);

    const { data, setData, put, processing, errors } = useForm({
        permissions: rolePermissions as number[],
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

    const hasAllResourcePermissions = (resourcePermissions: Permission[]) => {
        return resourcePermissions.every((p) =>
            data.permissions.includes(p.id),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(RoleController.update.url({ id: role.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${roleLabels[role.name] ?? role.name} Role`} />

            <Wrapper>
                <PageHeader
                    title={`Edit ${roleLabels[role.name] ?? role.name} Role`}
                    description="Manage permissions for this role"
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

                    {Object.keys(errors).length > 0 && (
                        <div className="text-sm text-destructive">
                            {Object.values(errors).join(', ')}
                        </div>
                    )}

                    <StickyFormActions
                        formId={formId}
                        processing={processing}
                        submitLabel={__('action.save_changes', 'Save Changes')}
                    />
                </form>
            </Wrapper>
        </AppLayout>
    );
}
