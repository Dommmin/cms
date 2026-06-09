<?php

declare(strict_types=1);

namespace App\Services\Hooks\Customer;

use App\Models\Customer;

final class CustomerRegisteredAction
{
    public function __construct(
        public readonly Customer $customer
    ) {}
}
