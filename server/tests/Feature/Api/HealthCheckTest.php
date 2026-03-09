<?php

declare(strict_types=1);

use Spatie\Health\Commands\RunHealthChecksCommand;

it('returns health status on public endpoint', function () {
    $this->artisan(RunHealthChecksCommand::class);

    $this->getJson('/api/health')
        ->assertOk()
        ->assertJsonStructure(['finishedAt', 'storedCheckResults']);
});

it('does not require authentication', function () {
    $this->artisan(RunHealthChecksCommand::class);

    $this->getJson('/api/health')
        ->assertOk();
});
