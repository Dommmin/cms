import type { LucideIcon } from 'lucide-react';
import type { IconProps } from './icon.types';

export function Icon({ iconNode: IconComponent, className }: IconProps) {
    if (!IconComponent) {
        return null;
    }

    return <IconComponent className={className} />;
}
