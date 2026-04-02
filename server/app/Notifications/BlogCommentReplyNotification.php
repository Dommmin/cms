<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\BlogComment;
use App\Models\BlogPost;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BlogCommentReplyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly BlogComment $reply,
        private readonly BlogPost $post,
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New reply to your comment on "'.$this->post->title.'"')
            ->line($this->reply->user->name.' replied to your comment:')
            ->line('"'.mb_substr($this->reply->body, 0, 200).'"')
            ->action('View Post', config('app.frontend_url').'/blog/'.$this->post->slug);
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'blog_comment_reply',
            'post_slug' => $this->post->slug,
            'reply_id' => $this->reply->id,
        ];
    }
}
