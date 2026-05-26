<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\BlogPostStatusEnum;
use App\Models\BlogPost;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Description('Publish scheduled blog posts whose publish date has passed')]
#[Signature('blog:publish-scheduled')]
class PublishScheduledBlogPosts extends Command
{
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
