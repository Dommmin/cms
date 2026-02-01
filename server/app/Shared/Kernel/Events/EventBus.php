<?php

declare(strict_types=1);

namespace App\Shared\Kernel\Events;

use Illuminate\Events\Dispatcher;

/**
 * Central Event Bus for Modular Monolith
 * All modules communicate through this bus
 */
final class EventBus
{
    public function __construct(
        private readonly Dispatcher $dispatcher
    ) {}

    /**
     * Dispatch an event
     */
    public function dispatch(object $event): void
    {
        $this->dispatcher->dispatch($event);
    }

    /**
     * Register an event listener
     */
    public function listen(string $event, callable|string $listener): void
    {
        $this->dispatcher->listen($event, $listener);
    }

    /**
     * Register multiple event listeners
     */
    public function subscribe(object $subscriber): void
    {
        $this->dispatcher->subscribe($subscriber);
    }
}

