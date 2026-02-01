<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // E-commerce permissions
            'products.view',
            'products.create',
            'products.update',
            'products.delete',
            'categories.view',
            'categories.create',
            'categories.update',
            'categories.delete',
            'orders.view',
            'orders.update',
            'orders.delete',
            'orders.fulfill',
            'customers.view',
            'customers.update',
            'customers.delete',

            // Blog permissions
            'posts.view',
            'posts.create',
            'posts.update',
            'posts.delete',
            'posts.publish',

            // Reviews permissions
            'reviews.view',
            'reviews.moderate',
            'reviews.delete',

            // Newsletter permissions
            'newsletter.view',
            'newsletter.create',
            'newsletter.send',
            'newsletter.delete',

            // Settings permissions
            'settings.view',
            'settings.update',

            // User management
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.assign_roles',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $editor = Role::firstOrCreate(['name' => 'editor', 'guard_name' => 'web']);
        $customer = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);

        // Assign all permissions to super-admin
        $superAdmin->givePermissionTo(Permission::all());

        // Admin permissions (all except user management)
        $admin->givePermissionTo([
            'products.view', 'products.create', 'products.update', 'products.delete',
            'categories.view', 'categories.create', 'categories.update', 'categories.delete',
            'orders.view', 'orders.update', 'orders.delete', 'orders.fulfill',
            'customers.view', 'customers.update', 'customers.delete',
            'posts.view', 'posts.create', 'posts.update', 'posts.delete', 'posts.publish',
            'reviews.view', 'reviews.moderate', 'reviews.delete',
            'newsletter.view', 'newsletter.create', 'newsletter.send', 'newsletter.delete',
            'settings.view', 'settings.update',
        ]);

        // Manager permissions (view and update, no delete)
        $manager->givePermissionTo([
            'products.view', 'products.create', 'products.update',
            'categories.view', 'categories.create', 'categories.update',
            'orders.view', 'orders.update', 'orders.fulfill',
            'customers.view', 'customers.update',
            'posts.view', 'posts.create', 'posts.update', 'posts.publish',
            'reviews.view', 'reviews.moderate',
            'newsletter.view', 'newsletter.create', 'newsletter.send',
            'settings.view',
        ]);

        // Editor permissions (content only)
        $editor->givePermissionTo([
            'products.view', 'products.create', 'products.update',
            'categories.view', 'categories.create', 'categories.update',
            'posts.view', 'posts.create', 'posts.update',
            'reviews.view', 'reviews.moderate',
            'newsletter.view', 'newsletter.create',
        ]);

        // Customer permissions (read-only)
        $customer->givePermissionTo([
            'products.view',
            'categories.view',
            'posts.view',
        ]);

        // Assign super-admin role to first user (if exists)
        $firstUser = User::first();
        if ($firstUser) {
            $firstUser->assignRole('super-admin');
        }
    }
}

