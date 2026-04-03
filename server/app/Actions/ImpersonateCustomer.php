<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class ImpersonateCustomer
{
    public function handle(User $admin, Customer $customer): string
    {
        abort_unless($admin->can('customers.impersonate'), 403, 'Unauthorized to impersonate customers');

        $user = $customer->user;

        abort_unless($user, 404, 'Customer has no associated user account');

        Session::put('impersonator_id', $admin->id);
        Session::put('impersonating_customer', true);

        Auth::login($user);

        return route('account.index');
    }
}
