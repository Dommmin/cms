<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Role::class, 'role');
    }

    public function index(): Response
    {
        $roles = Role::query()
            ->with('permissions:id,name')
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return inertia('admin/roles/index', [
            'roles' => $roles,
        ]);
    }

    public function create(): Response
    {
        $permissions = Permission::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $groupedPermissions = $permissions
            ->groupBy(fn (Permission $permission): string => explode('.', $permission->name)[0])
            ->map(fn ($group, $resource): array => [
                'resource' => $resource,
                'permissions' => $group->map(fn (Permission $p): array => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'action' => explode('.', $p->name)[1] ?? $p->name,
                ])->values(),
            ])
            ->values();

        return inertia('admin/roles/create', [
            'groupedPermissions' => $groupedPermissions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role = Role::create([
            'name' => $request->input('name'),
            'guard_name' => 'web',
            'is_system' => false,
        ]);

        $role->syncPermissions($request->input('permissions', []));

        return to_route('admin.roles.index')
            ->with('success', sprintf('Role "%s" created.', $role->name));
    }

    public function edit(Role $role): Response
    {
        $role->load('permissions:id,name');

        $permissions = Permission::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $groupedPermissions = $permissions
            ->groupBy(fn (Permission $permission): string => explode('.', $permission->name)[0])
            ->map(fn ($group, $resource): array => [
                'resource' => $resource,
                'permissions' => $group->map(fn (Permission $p): array => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'action' => explode('.', $p->name)[1] ?? $p->name,
                ])->values(),
            ])
            ->values();

        return inertia('admin/roles/edit', [
            'role' => $role,
            'groupedPermissions' => $groupedPermissions,
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $this->authorize('update', $role);

        if (! (bool) $role->getAttribute('is_system')) {
            $request->validate([
                'name' => ['required', 'string', 'max:255', 'unique:roles,name,'.$role->id],
            ]);
            $role->update(['name' => $request->input('name')]);
        }

        $role->syncPermissions($request->input('permissions', []));

        return back()->with('success', 'Role permissions updated');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        if ((bool) $role->getAttribute('is_system')) {
            return back()->withErrors(['role' => 'System roles cannot be deleted.']);
        }

        if ($role->users()->count() > 0) {
            return back()->withErrors(['role' => 'Cannot delete a role that has users assigned.']);
        }

        $role->delete();

        return to_route('admin.roles.index')
            ->with('success', sprintf('Role "%s" deleted.', $role->name));
    }
}
