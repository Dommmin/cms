<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Customer;
use App\Services\Hooks\Customer\CustomerRegisteredAction;
use App\Services\Hooks\Facades\Hook;

class CustomerObserver
{
    public function created(Customer $customer): void
    {
        Hook::action(new CustomerRegisteredAction($customer));
    }
}
