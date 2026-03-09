<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAffiliateCodeRequest;
use App\Http\Requests\Admin\UpdateAffiliateCodeRequest;
use App\Models\AffiliateCode;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class AffiliateCodeController extends Controller
{
    public function index(Request $request): Response
    {
        $codes = AffiliateCode::query()
            ->with('user:id,name,email')
            ->when($request->input('search'), fn ($q, $s) => $q->where('code', 'like', "%{$s}%")->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$s}%")))
            ->when($request->input('status'), fn ($q, $s) => match ($s) {
                'active' => $q->where('is_active', true),
                'inactive' => $q->where('is_active', false),
                default => $q
            })
            ->withCount('referrals')
            ->withSum('referrals', 'commission_amount')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return inertia('admin/affiliates/codes/index', [
            'codes' => $codes,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        $users = User::query()->select('id', 'name', 'email')->orderBy('name')->get();

        return inertia('admin/affiliates/codes/create', [
            'users' => $users,
        ]);
    }

    public function store(StoreAffiliateCodeRequest $request): RedirectResponse
    {
        AffiliateCode::query()->create($request->validated());

        return redirect()->route('admin.affiliates.codes.index')->with('success', 'Affiliate code created successfully.');
    }

    public function edit(AffiliateCode $code): Response
    {
        $users = User::query()->select('id', 'name', 'email')->orderBy('name')->get();

        return inertia('admin/affiliates/codes/edit', [
            'code' => $code->load('user:id,name,email'),
            'users' => $users,
        ]);
    }

    public function update(UpdateAffiliateCodeRequest $request, AffiliateCode $code): RedirectResponse
    {
        $code->update($request->validated());

        return redirect()->back()->with('success', 'Affiliate code updated successfully.');
    }

    public function destroy(AffiliateCode $code): RedirectResponse
    {
        $code->delete();

        return redirect()->back()->with('success', 'Affiliate code deleted.');
    }

    public function toggleActive(AffiliateCode $code): RedirectResponse
    {
        $code->update(['is_active' => ! $code->is_active]);

        return redirect()->back()->with('success', $code->is_active ? 'Code activated.' : 'Code deactivated.');
    }
}
