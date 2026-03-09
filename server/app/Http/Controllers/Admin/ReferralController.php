<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ReferralController extends Controller
{
    public function index(Request $request): Response
    {
        $referrals = Referral::query()
            ->with([
                'affiliateCode:id,code,user_id',
                'affiliateCode.user:id,name,email',
                'order:id,reference_number,total,status',
                'referredUser:id,name,email',
            ])
            ->when($request->input('search'), fn ($q, $s) => $q->whereHas('affiliateCode', fn ($cq) => $cq->where('code', 'like', "%{$s}%")))
            ->when($request->input('status'), fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $stats = [
            'total_referrals' => Referral::query()->count(),
            'pending_commissions' => Referral::query()->where('status', 'pending')->sum('commission_amount'),
            'approved_commissions' => Referral::query()->where('status', 'approved')->sum('commission_amount'),
            'paid_commissions' => Referral::query()->where('status', 'paid')->sum('commission_amount'),
        ];

        return inertia('admin/affiliates/referrals/index', [
            'referrals' => $referrals,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function approve(Referral $referral): RedirectResponse
    {
        if ($referral->status !== 'pending') {
            return redirect()->back()->with('error', 'Only pending referrals can be approved.');
        }

        $referral->update(['status' => 'approved']);

        return redirect()->back()->with('success', 'Referral approved.');
    }

    public function markPaid(Referral $referral): RedirectResponse
    {
        if ($referral->status !== 'approved') {
            return redirect()->back()->with('error', 'Only approved referrals can be marked as paid.');
        }

        $referral->update(['status' => 'paid', 'paid_at' => now()]);

        return redirect()->back()->with('success', 'Referral marked as paid.');
    }

    public function cancel(Referral $referral): RedirectResponse
    {
        if (in_array($referral->status, ['paid'])) {
            return redirect()->back()->with('error', 'Paid referrals cannot be cancelled.');
        }

        $referral->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Referral cancelled.');
    }

    public function bulkMarkPaid(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);

        Referral::query()
            ->whereIn('id', $ids)
            ->where('status', 'approved')
            ->update(['status' => 'paid', 'paid_at' => now()]);

        return redirect()->back()->with('success', 'Selected referrals marked as paid.');
    }
}
