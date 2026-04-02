'use client';

import { formatDistanceToNow } from 'date-fns';
import { CornerDownRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { startTransition, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useMe } from '@/hooks/use-auth';
import { useBlogComments, usePostBlogComment } from '@/hooks/use-blog-comments';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import type {
    AvatarProps,
    BlogCommentsProps,
    CommentFormProps,
    CommentItemProps,
} from './blog-comments.types';

function CommentTimestamp({ createdAt }: { createdAt: string }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        startTransition(() => setIsMounted(true));
    }, []);

    if (!isMounted) return null;

    return <>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</>;
}

function Avatar({ name, size = 'md' }: AvatarProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';

    return (
        <div
            className={`bg-primary/10 text-primary flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClass}`}
            aria-hidden="true"
        >
            {initials}
        </div>
    );
}

function CommentForm({
    slug,
    parentId,
    replyingTo,
    onCancel,
}: CommentFormProps) {
    const { t } = useTranslation();
    const [body, setBody] = useState('');
    const { mutate, isPending } = usePostBlogComment(slug);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        mutate(
            { body, parent_id: parentId },
            {
                onSuccess: () => {
                    setBody('');
                    toast.success(t('blog.comment_posted', 'Comment posted!'));
                    onCancel?.();
                },
                onError: () =>
                    toast.error(t('common.error', 'Something went wrong')),
            },
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {replyingTo && (
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <CornerDownRight className="h-3 w-3" aria-hidden="true" />
                    {t('blog.replying_to', 'Replying to')}{' '}
                    <span className="text-primary font-semibold">
                        {replyingTo}
                    </span>
                </p>
            )}
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                    replyingTo
                        ? t('blog.reply_placeholder', 'Write a reply…')
                        : t('blog.comment_placeholder', 'Write a comment…')
                }
                rows={3}
                minLength={3}
                maxLength={2000}
                required
                autoFocus={!!replyingTo}
                className="border-input bg-background w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-offset-1 focus:outline-none"
            />
            <div className="flex items-center gap-2">
                <button
                    type="submit"
                    disabled={isPending || body.trim().length < 3}
                    className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                    {isPending
                        ? t('common.sending', 'Sending…')
                        : replyingTo
                          ? t('blog.post_reply', 'Post reply')
                          : t('blog.post_comment', 'Post comment')}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-muted-foreground text-sm hover:underline"
                    >
                        {t('common.cancel', 'Cancel')}
                    </button>
                )}
            </div>
        </form>
    );
}

function CommentItem({ comment, slug }: CommentItemProps) {
    const { t } = useTranslation();
    const { data: user } = useMe();
    const [showReply, setShowReply] = useState(false);
    const hasReplies = comment.replies.length > 0;

    return (
        <div className="flex gap-3 sm:gap-4">
            {/* Avatar column */}
            <Avatar name={comment.user.name} />

            {/* Content column */}
            <div className="min-w-0 flex-1">
                {/* Author + timestamp */}
                <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-bold">
                        {comment.user.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                        <CommentTimestamp createdAt={comment.created_at} />
                    </span>
                </div>

                {/* Body */}
                <p className="text-sm leading-relaxed">{comment.body}</p>

                {/* Reply button */}
                {user && (
                    <button
                        onClick={() => setShowReply(!showReply)}
                        className="text-muted-foreground hover:text-primary mt-2 flex items-center gap-1 text-xs font-medium transition-colors"
                    >
                        <CornerDownRight
                            className="h-3 w-3"
                            aria-hidden="true"
                        />
                        {showReply
                            ? t('common.cancel', 'Cancel')
                            : t('blog.reply', 'Reply')}
                    </button>
                )}

                {/* Replies thread */}
                {(hasReplies || showReply) && (
                    <div className="mt-4 space-y-4 border-l-2 border-gray-200 pl-4 sm:pl-5 dark:border-gray-700">
                        {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                                <Avatar name={reply.user.name} size="sm" />
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                        <span className="text-sm font-bold">
                                            {reply.user.name}
                                        </span>
                                        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                                            <CornerDownRight
                                                className="h-3 w-3 shrink-0"
                                                aria-hidden="true"
                                            />
                                            <span className="text-primary font-medium">
                                                @{comment.user.name}
                                            </span>
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            <CommentTimestamp
                                                createdAt={reply.created_at}
                                            />
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed">
                                        {reply.body}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {showReply && (
                            <CommentForm
                                slug={slug}
                                parentId={comment.id}
                                onCancel={() => setShowReply(false)}
                                replyingTo={comment.user.name}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export function BlogComments({ slug, locale }: BlogCommentsProps) {
    const { t } = useTranslation();
    const lp = useLocalePath();
    const { data: user } = useMe();
    const { data, isLoading } = useBlogComments(slug);

    const comments = data?.data ?? [];

    return (
        <section className="mt-12 border-t pt-8">
            <h2 className="mb-8 flex items-center gap-2 text-xl font-bold">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
                {t('blog.comments', 'Comments')}
                {data?.meta.total != null && (
                    <span className="text-muted-foreground text-base font-normal">
                        ({data.meta.total})
                    </span>
                )}
            </h2>

            {/* Comment form / login prompt */}
            {user ? (
                <div className="mb-10 flex gap-3 sm:gap-4">
                    <Avatar name={user.name} />
                    <div className="min-w-0 flex-1">
                        <CommentForm slug={slug} />
                    </div>
                </div>
            ) : (
                <div className="border-border bg-muted/30 mb-10 rounded-lg border p-4 text-sm">
                    <Link
                        href={lp('/login')}
                        className="text-primary font-semibold hover:underline"
                    >
                        {t(
                            'blog.login_to_comment',
                            'Log in to leave a comment',
                        )}
                    </Link>
                </div>
            )}

            {/* Comments list */}
            {isLoading ? (
                <div className="space-y-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                            <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="bg-muted h-3 w-32 animate-pulse rounded" />
                                <div className="bg-muted h-3 w-full animate-pulse rounded" />
                                <div className="bg-muted h-3 w-3/4 animate-pulse rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    {t('blog.no_comments', 'No comments yet. Be the first!')}
                </p>
            ) : (
                <div className="divide-border divide-y">
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="py-6 first:pt-0 last:pb-0"
                        >
                            <CommentItem comment={comment} slug={slug} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
