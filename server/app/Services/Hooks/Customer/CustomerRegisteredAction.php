<?php

declare(strict_types=1);

namespace App\Services\Hooks\Customer;

use App\Models\Customer;

final readonly class CustomerRegisteredAction
{
    public function __construct(
        public Customer $customer
    ) {}
}
