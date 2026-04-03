<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\AnonymizeUserData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use App\Queries\Admin\UserIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(User::class, 'user');
    }

    public function index(Request $request): Response
    {
        $userQuery = new UserIndexQuery($request);
        $users = $userQuery->execute();

        return inertia('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return inertia('admin/users/create', [
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    public function edit(User $user): Response
    {
        $user->load('roles:id,name');

        return inertia('admin/users/edit', [
            'user' => $user,
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $roles = $data['roles'] ?? [];
        unset($data['roles']);

        $user = User::query()->create($data);

        if (! empty($roles)) {
            $user->assignRole($roles);
        }

        return redirect(route('admin.users.edit', $user))->with('success', 'User created');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $roles = $data['roles'] ?? [];
        unset($data['roles']);

        $user->update($data);

        if (! empty($roles)) {
            $user->syncRoles($roles);
        }

        return back()->with('success', 'User updated');
    }

    public function destroy(User $user): RedirectResponse
    {
        (new AnonymizeUserData)->handle($user);

        return back()->with('success', 'User deleted');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        User::query()->whereIn('id', $request->ids)->each(fn (User $user) => (new AnonymizeUserData)->handle($user));

        return back()->with('success', 'Users deleted');
    }

    public function trashed(): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::onlyTrashed()
            ->latest('deleted_at')
            ->paginate(20);

        return inertia('admin/users/trashed', [
            'users' => $users,
        ]);
    }

    public function restore(User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $user->restore();

        if ($user->customer()->withTrashed()->exists()) {
            $user->customer()->withTrashed()->first()?->restore();
        }

        return back()->with('success', 'User restored');
    }

    public function forceDelete(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        $user->forceDelete();

        return redirect(route('admin.users.trashed'))->with('success', 'User permanently deleted');
    }
}
