'use client';

import { useEffect, useState } from 'react';

import { useRecordBlogView } from '@/hooks/use-blog-comments';
import type { BlogViewTrackerProps } from './_blog-view-tracker.types';

export function BlogViewTracker({ slug, initialCount }: BlogViewTrackerProps) {
  const [count, setCount] = useState(initialCount);
  const { mutate: recordView } = useRecordBlogView(slug);

  useEffect(() => {
    recordView(undefined, {
      onSuccess: (result) => {
        if (result?.views_count != null) {
          setCount(result.views_count);
        }
      },
    });
    // Only fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="text-muted-foreground flex items-center gap-1 text-sm">
      <span aria-hidden="true">👁</span>
      <span>{count}</span>
    </div>
  );
}
