<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Description('Permanently remove soft-deleted users older than the specified number of days')]
#[Signature('user:prune {--days=30 : Number of days after deletion to permanently remove}')]
class PruneDeletedUsers extends Command
{
    public function handle(): int
    {
        $days = (int) $this->option('days');

        $count = User::onlyTrashed()
            ->where('deleted_at', '<', now()->subDays($days))
            ->count();

        if ($count === 0) {
            $this->info('No deleted users to prune.');

            return self::SUCCESS;
        }

        User::onlyTrashed()
            ->where('deleted_at', '<', now()->subDays($days))
            ->each(fn (User $user) => $user->forceDelete());

        $this->info(sprintf('Pruned %d deleted user(s) older than %d days.', $count, $days));

        return self::SUCCESS;
    }
}
