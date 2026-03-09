<?php

declare(strict_types=1);

use App\Models\User;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $this->actingAs($admin);
});

it('exports orders as xlsx', function () {
    Excel::fake();

    $this->get(route('admin.ecommerce.orders.export'))
        ->assertOk();

    Excel::assertDownloaded('orders-'.now()->format('Y-m-d').'.xlsx');
});
