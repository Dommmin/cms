import type * as React from 'react';

import type { Button } from '@/components/ui/button';

export type PaginationLinkProps = {
    isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
    React.ComponentProps<'button'>;
