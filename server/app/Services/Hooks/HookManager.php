<?php

declare(strict_types=1);

namespace App\Services\Hooks;

use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;

final class HookManager
{
    /**
     * Registered listeners grouped by hook name/class, and priority.
     *
     * @var array<string, array<int, array<mixed>>>
     */
    private array $listeners = [];

    public function __construct(private readonly Container $container) {}

    /**
     * Register a listener for a hook (action or filter).
     *
     * @param  string  $hook  Hook class name or string identifier.
     * @param  mixed  $callback  Closure, array callable [Class, method], string class, or callable.
     * @param  int  $priority  Priority (lower runs first, default 10).
     */
    public function listen(string $hook, mixed $callback, int $priority = 10): void
    {
        $this->listeners[$hook][$priority][] = $callback;
        ksort($this->listeners[$hook]);
    }

    /**
     * Execute action hook.
     *
     * @param  object|string  $hook  Hook instance or string name.
     * @param  mixed  ...$args  Additional arguments (used if hook is a string).
     */
    public function action(object|string $hook, ...$args): void
    {
        $key = is_object($hook) ? $hook::class : $hook;

        if (! isset($this->listeners[$key])) {
            return;
        }

        foreach ($this->listeners[$key] as $callbacks) {
            foreach ($callbacks as $callback) {
                $this->execute($callback, is_object($hook) ? [$hook] : $args);
            }
        }
    }

    /**
     * Run filters, passing the value through the registered callbacks.
     *
     * @param  object|string  $hook  Hook instance (if class-based) or string name.
     * @param  mixed  $value  The value to filter (used if hook is a string).
     * @param  mixed  ...$args  Additional arguments (used if hook is a string).
     * @return mixed Filtered value or filtered object.
     */
    public function filter(object|string $hook, mixed $value = null, ...$args): mixed
    {
        if (is_object($hook)) {
            $key = $hook::class;
            if (! isset($this->listeners[$key])) {
                return $hook;
            }

            foreach ($this->listeners[$key] as $callbacks) {
                foreach ($callbacks as $callback) {
                    $this->execute($callback, [$hook]);
                }
            }

            return $hook;
        }

        if (! isset($this->listeners[$hook])) {
            return $value;
        }

        foreach ($this->listeners[$hook] as $callbacks) {
            foreach ($callbacks as $callback) {
                $value = $this->execute($callback, array_merge([$value], $args));
            }
        }

        return $value;
    }

    /**
     * Execute a listener callback.
     */
    private function execute(mixed $callback, array $args): mixed
    {
        if (is_callable($callback)) {
            return $callback(...$args);
        }

        if (is_string($callback)) {
            $instance = $this->container->make($callback);

            return $this->container->call([$instance, 'handle'], $args);
        }

        if (is_array($callback) && count($callback) === 2 && is_string($callback[0])) {
            $instance = $this->container->make($callback[0]);

            return $this->container->call([$instance, $callback[1]], $args);
        }

        throw new InvalidArgumentException('Invalid hook listener callback type.');
    }
}
