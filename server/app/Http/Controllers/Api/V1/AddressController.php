<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreAddressRequest;
use App\Http\Resources\Api\V1\AddressResource;
use App\Models\Address;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AddressController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $customer = $this->ensureCustomer($request);

        return AddressResource::collection($customer->addresses()->orderBy('is_default', 'desc')->get());
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        $customer = $this->ensureCustomer($request);
        $data = $request->validated();

        if (($data['is_default'] ?? false) && $data['is_default']) {
            $customer->addresses()->update(['is_default' => false]);
        }

        $address = $customer->addresses()->create($data);

        return response()->json(new AddressResource($address), 201);
    }

    public function show(Request $request, Address $address): JsonResponse
    {
        $this->authorizeAddress($request, $address);

        return response()->json(new AddressResource($address));
    }

    public function update(StoreAddressRequest $request, Address $address): JsonResponse
    {
        $this->authorizeAddress($request, $address);
        $data = $request->validated();

        if (($data['is_default'] ?? false) && $data['is_default']) {
            $address->customer->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($data);

        return response()->json(new AddressResource($address->fresh()));
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorizeAddress($request, $address);
        $address->delete();

        return response()->json(null, 204);
    }

    public function setDefault(Request $request, Address $address): JsonResponse
    {
        $this->authorizeAddress($request, $address);
        $address->customer->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json(new AddressResource($address->fresh()));
    }

    private function ensureCustomer(Request $request): Customer
    {
        $user = $request->user();
        $customer = $user->customer;

        if (! $customer) {
            return Customer::query()->create([
                'user_id' => $user->id,
                'email' => $user->email,
                'first_name' => $user->name,
            ]);
        }

        return $customer;
    }

    private function authorizeAddress(Request $request, Address $address): void
    {
        $user = $request->user();
        abort_if(! $user->customer || $address->customer_id !== $user->customer->id, 403, 'Address does not belong to you');
    }
}
