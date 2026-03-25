<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\BlogPostStatusEnum;
use App\Models\BlogPost;
use Illuminate\Console\Command;

class PublishScheduledBlogPosts extends Command
{
    protected $signature = 'blog:publish-scheduled';

    protected $description = 'Publish scheduled blog posts whose publish date has passed';

    public function handle(): int
    {
        $count = BlogPost::query()
            ->where('status', BlogPostStatusEnum::Scheduled)
            ->where('published_at', '<=', now())
            ->update(['status' => BlogPostStatusEnum::Published]);

        $this->info(sprintf('Published %d scheduled blog post(s).', $count));

        return self::SUCCESS;
    }
}
