<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin\Ecommerce;

use App\Enums\AddressTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ecommerce\UpdateAddressRequest;
use App\Models\Address;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Customer $customer): Response
    {
        $addresses = $customer->addresses()
            ->orderByDesc('is_default')->oldest()
            ->get();

        return inertia('admin/ecommerce/customers/addresses/index', [
            'customer' => $customer,
            'addresses' => $addresses,
        ]);
    }

    public function create(Customer $customer): Response
    {
        return inertia('admin/ecommerce/customers/addresses/create', [
            'customer' => $customer,
            'types' => array_map(fn (AddressTypeEnum $t): array => ['value' => $t->value, 'label' => $t->getLabel()], AddressTypeEnum::cases()),
        ]);
    }

    public function store(Request $request, Customer $customer): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'street' => ['required', 'string', 'max:255'],
            'street2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country_code' => ['required', 'string', 'size:2'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_default' => ['boolean'],
        ]);

        $data['customer_id'] = $customer->id;

        if ($data['is_default'] ?? false) {
            $customer->addresses()
                ->where('type', $data['type'])
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        Address::query()->create($data);

        return to_route('admin.ecommerce.customers.addresses.index', $customer)
            ->with('success', 'Adres został dodany');
    }

    public function edit(Customer $customer, Address $address): Response
    {
        return inertia('admin/ecommerce/customers/addresses/edit', [
            'customer' => $customer,
            'address' => $address,
            'types' => array_map(fn (AddressTypeEnum $t): array => ['value' => $t->value, 'label' => $t->getLabel()], AddressTypeEnum::cases()),
        ]);
    }

    public function update(UpdateAddressRequest $request, Customer $customer, Address $address): RedirectResponse
    {
        $data = $request->validated();
        $data['is_default'] ??= false;

        if ($data['is_default'] && ! $address->is_default) {
            $customer->addresses()
                ->where('type', $data['type'])
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $address->update($data);

        return back()->with('success', 'Adres został zaktualizowany');
    }

    public function destroy(Customer $customer, Address $address): RedirectResponse
    {
        $address->delete();

        return back()->with('success', 'Adres został usunięty');
    }

    public function setDefault(Customer $customer, Address $address): RedirectResponse
    {
        $customer->addresses()
            ->where('type', $address->type)
            ->where('is_default', true)
            ->update(['is_default' => false]);

        $address->update(['is_default' => true]);

        return back()->with('success', 'Adres został ustawiony jako domyślny');
    }
}
