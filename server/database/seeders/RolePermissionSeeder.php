<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $this->createPermissions();
        $this->createRoles();
        $this->assignPermissionsToRoles();
    }

    private function createPermissions(): void
    {
        $permissions = [
            'products' => ['view', 'create', 'edit', 'delete'],
            'categories' => ['view', 'create', 'edit', 'delete'],
            'orders' => ['view', 'manage', 'cancel', 'refund'],
            'customers' => ['view', 'edit', 'delete', 'impersonate'],
            'reviews' => ['view', 'moderate', 'delete'],
            'blog' => ['view', 'create', 'edit', 'delete'],
            'pages' => ['view', 'create', 'edit', 'delete'],
            'discounts' => ['view', 'create', 'edit', 'delete'],
            'promotions' => ['view', 'create', 'edit', 'delete'],
            'settings' => ['view', 'edit'],
            'users' => ['view', 'create', 'edit', 'delete'],
            'roles' => ['view', 'edit'],
            'reports' => ['view'],
            'shipping' => ['view', 'edit'],
            'payments' => ['view', 'manage'],
            'notifications' => ['view', 'send'],
            'exports' => ['view', 'create'],
            'imports' => ['view', 'create'],
        ];

        foreach ($permissions as $resource => $actions) {
            foreach ($actions as $action) {
                Permission::query()->firstOrCreate([
                    'name' => sprintf('%s.%s', $resource, $action),
                    'guard_name' => 'web',
                ]);
            }
        }
    }

    private function createRoles(): void
    {
        $roles = [
            'super-admin' => 'Full system access',
            'admin' => 'System administration',
            'manager' => 'Product and order management',
            'editor' => 'Content management',
            'support' => 'Customer support and orders',
            'viewer' => 'Read-only access',
        ];

        foreach (array_keys($roles) as $name) {
            Role::query()->firstOrCreate(['name' => $name]);
        }

        Role::query()->firstOrCreate(['name' => 'customer']);
    }

    private function assignPermissionsToRoles(): void
    {
        Role::findByName('super-admin')->syncPermissions(Permission::all());

        Role::findByName('admin')->syncPermissions([
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
            'orders.view', 'orders.manage', 'orders.cancel', 'orders.refund',
            'customers.view', 'customers.edit',
            'reviews.view', 'reviews.moderate', 'reviews.delete',
            'blog.view', 'blog.create', 'blog.edit', 'blog.delete',
            'pages.view', 'pages.create', 'pages.edit', 'pages.delete',
            'discounts.view', 'discounts.create', 'discounts.edit', 'discounts.delete',
            'promotions.view', 'promotions.create', 'promotions.edit', 'promotions.delete',
            'settings.view', 'settings.edit',
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'roles.view', 'roles.edit',
            'reports.view',
            'shipping.view', 'shipping.edit',
            'payments.view', 'payments.manage',
            'notifications.view', 'notifications.send',
            'exports.view', 'exports.create',
            'imports.view', 'imports.create',
        ]);

        Role::findByName('manager')->syncPermissions([
            'products.view', 'products.create', 'products.edit',
            'categories.view', 'categories.create', 'categories.edit',
            'orders.view', 'orders.manage',
            'customers.view',
            'reviews.view', 'reviews.moderate',
            'discounts.view', 'discounts.create', 'discounts.edit',
            'promotions.view', 'promotions.create', 'promotions.edit',
            'reports.view',
            'shipping.view', 'shipping.edit',
            'exports.view', 'exports.create',
            'imports.view', 'imports.create',
        ]);

        Role::findByName('editor')->syncPermissions([
            'products.view', 'products.edit',
            'categories.view',
            'blog.view', 'blog.create', 'blog.edit',
            'pages.view', 'pages.create', 'pages.edit',
            'reviews.view', 'reviews.moderate',
        ]);

        Role::findByName('support')->syncPermissions([
            'orders.view', 'orders.manage', 'orders.cancel',
            'customers.view', 'customers.edit',
            'reviews.view', 'reviews.moderate',
            'notifications.view', 'notifications.send',
        ]);

        Role::findByName('viewer')->syncPermissions([
            'products.view',
            'categories.view',
            'orders.view',
            'customers.view',
            'reviews.view',
            'blog.view',
            'pages.view',
            'reports.view',
        ]);
    }
}
