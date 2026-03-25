<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\NotificationChannelEnum;
use App\Enums\NotificationStatusEnum;
use App\Enums\NotificationTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAppNotificationRequest;
use App\Models\AppNotification;
use App\Models\Customer;
use App\Queries\Admin\AppNotificationIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class AppNotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notificationQuery = new AppNotificationIndexQuery($request);
        $notifications = $notificationQuery->execute();

        return inertia('admin/notifications/index', [
            'notifications' => $notifications,
            'filters' => $request->only(['search', 'type', 'channel', 'status']),
            'types' => array_map(fn (NotificationTypeEnum $t): array => ['value' => $t->value, 'label' => $t->label()], NotificationTypeEnum::cases()),
            'channels' => array_map(fn (NotificationChannelEnum $c): array => ['value' => $c->value, 'label' => $c->label()], NotificationChannelEnum::cases()),
            'statuses' => array_map(fn (NotificationStatusEnum $s): array => ['value' => $s->value, 'label' => $s->label()], NotificationStatusEnum::cases()),
        ]);
    }

    public function show(AppNotification $notification): Response
    {
        $notification->load('customer');

        return inertia('admin/notifications/show', [
            'notification' => $notification,
        ]);
    }

    public function resend(AppNotification $notification): RedirectResponse
    {
        if ($notification->status !== NotificationStatusEnum::Failed) {
            return back()->with('error', 'Można ponawiać tylko powiadomienia z błędem');
        }

        // Reset statusu
        $notification->update([
            'status' => NotificationStatusEnum::Pending,
            'error_message' => null,
            'failed_at' => null,
        ]);

        // TODO: Dispatch job do wysłania

        return back()->with('success', 'Powiadomienie zostało dodane do kolejki');
    }

    public function destroy(AppNotification $notification): RedirectResponse
    {
        $notification->delete();

        return back()->with('success', 'Powiadomienie zostało usunięte');
    }

    public function bulkDelete(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);

        AppNotification::query()->whereIn('id', $ids)->delete();

        return back()->with('success', 'Zaznaczone powiadomienia zostały usunięte');
    }

    public function create(): Response
    {
        $customers = Customer::query()->select(['id', 'first_name', 'last_name', 'email'])
            ->orderBy('last_name')
            ->get();

        return inertia('admin/notifications/create', [
            'customers' => $customers,
            'types' => array_map(fn (NotificationTypeEnum $t): array => ['value' => $t->value, 'label' => $t->label()], NotificationTypeEnum::cases()),
            'channels' => array_map(fn (NotificationChannelEnum $c): array => ['value' => $c->value, 'label' => $c->label()], NotificationChannelEnum::cases()),
        ]);
    }

    public function store(StoreAppNotificationRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['status'] = NotificationStatusEnum::Pending->value;

        AppNotification::query()->create($data);

        return to_route('admin.notifications.index')->with('success', 'Powiadomienie zostało utworzone');
    }
}
