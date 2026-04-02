import type { BlogComment } from '@/types/api';

export interface CommentFormProps {
  slug: string;
  parentId?: number;
  replyingTo?: string;
  onCancel?: () => void;
}

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
}

export interface CommentItemProps {
  comment: BlogComment;
  slug: string;
}

export interface BlogCommentsProps {
  slug: string;
  locale: string;
}
