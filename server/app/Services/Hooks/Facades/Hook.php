<?php

declare(strict_types=1);

namespace App\Services\Hooks\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static void listen(string $hook, mixed $callback, int $priority = 10)
 * @method static void action(object|string $hook, ...$args)
 * @method static mixed filter(object|string $hook, mixed $value = null, ...$args)
 *
 * @see \App\Services\Hooks\HookManager
 */
final class Hook extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'hook.manager';
    }
}
