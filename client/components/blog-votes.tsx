'use client';

import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useMe } from '@/hooks/use-auth';
import { useBlogVote } from '@/hooks/use-blog-comments';
import { useTranslation } from '@/hooks/use-translation';
import type { BlogVotesProps } from './blog-votes.types';

const upIdle = 'border-border text-muted-foreground hover:border-green-400 hover:text-green-600';
const downIdle = 'border-border text-muted-foreground hover:border-red-400 hover:text-red-600';

const btnBase =
  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-50';

const upActiveStyle = {
  borderColor: 'rgb(34 197 94)',
  backgroundColor: 'rgb(240 253 244)',
  color: 'rgb(21 128 61)',
};

const downActiveStyle = {
  borderColor: 'rgb(239 68 68)',
  backgroundColor: 'rgb(254 242 242)',
  color: 'rgb(185 28 28)',
};

export function BlogVotes({ post }: BlogVotesProps) {
  const { t } = useTranslation();
  const { data: user } = useMe();
  const { mutate: vote, isPending } = useBlogVote(post.slug);

  const [votesUp, setVotesUp] = useState(post.votes_up ?? 0);
  const [votesDown, setVotesDown] = useState(post.votes_down ?? 0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(post.user_vote ?? null);
  const isUpActive = userVote === 'up';
  const isDownActive = userVote === 'down';

  // Sync if post prop changes (e.g. navigation)
  useEffect(() => {
    setVotesUp(post.votes_up ?? 0);
    setVotesDown(post.votes_down ?? 0);
    setUserVote(post.user_vote ?? null);
  }, [post.votes_up, post.votes_down, post.user_vote]);

  function handleVote(direction: 'up' | 'down') {
    if (!user) {
      toast.info(t('blog.login_to_vote', 'Log in to vote'));
      return;
    }
    vote(direction, {
      onSuccess: (result) => {
        if (!result) return;
        setVotesUp(result.votes_up);
        setVotesDown(result.votes_down);
        setUserVote(result.user_vote);
      },
      onError: () => toast.error(t('common.error', 'Something went wrong')),
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-sm">
        {t('blog.helpful', 'Was this helpful?')}
      </span>

      <button
        onClick={() => handleVote('up')}
        disabled={isPending}
        aria-label={t('blog.vote_up', 'Vote up')}
        aria-pressed={isUpActive}
        className={`${btnBase} ${isUpActive ? '' : upIdle}`}
        style={isUpActive ? upActiveStyle : undefined}
      >
        <ThumbsUp className="h-4 w-4" aria-hidden="true" />
        <span>{votesUp}</span>
      </button>

      <button
        onClick={() => handleVote('down')}
        disabled={isPending}
        aria-label={t('blog.vote_down', 'Vote down')}
        aria-pressed={isDownActive}
        className={`${btnBase} ${isDownActive ? '' : downIdle}`}
        style={isDownActive ? downActiveStyle : undefined}
      >
        <ThumbsDown className="h-4 w-4" aria-hidden="true" />
        <span>{votesDown}</span>
      </button>
    </div>
  );
}
