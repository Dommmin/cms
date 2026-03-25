<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>|string>
     */
    public function rules(): array
    {
        /** @var User $user */
        $user = $this->route('user');
        $roleIds = Role::query()->pluck('id')->toArray();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'password' => ['nullable', 'string', 'confirmed', Password::defaults()],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', 'in:'.implode(',', $roleIds)],
        ];
    }
}
