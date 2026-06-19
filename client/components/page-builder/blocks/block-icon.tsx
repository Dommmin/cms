import {
    Award,
    BarChart3,
    Bolt,
    Camera,
    Check,
    Clock,
    Code,
    File,
    Folder,
    Gift,
    Globe,
    Heart,
    Leaf,
    Lock,
    type LucideIcon,
    Mail,
    Moon,
    Music,
    Phone,
    Rocket,
    RotateCcw,
    Settings,
    Shield,
    Star,
    Sun,
    Tag,
    Truck,
    Users,
    Video,
    Zap,
} from 'lucide-react';
import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

import type { BlockIconProps } from './block-icon.types';

const iconMap: Record<string, LucideIcon> = {
    check: Check,
    star: Star,
    bolt: Bolt,
    heart: Heart,
    shield: Shield,
    lock: Lock,
    truck: Truck,
    clock: Clock,
    globe: Globe,
    phone: Phone,
    mail: Mail,
    users: Users,
    chart: BarChart3,
    rocket: Rocket,
    leaf: Leaf,
    sun: Sun,
    moon: Moon,
    zap: Zap,
    award: Award,
    gift: Gift,
    tag: Tag,
    settings: Settings,
    code: Code,
    camera: Camera,
    music: Music,
    video: Video,
    file: File,
    folder: Folder,
    return: RotateCcw,
};

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
} as const;

export function BlockIcon({
    name,
    color,
    size = 'md',
    className,
}: BlockIconProps) {
    const key = name?.toLowerCase() ?? '';
    const Icon = iconMap[key] ?? Check;

    return (
        <Icon
            aria-hidden="true"
            className={cn(
                sizeClasses[size],
                color ? 'text-[var(--block-icon-color)]' : 'text-primary',
                className,
            )}
            style={
                color
                    ? ({ '--block-icon-color': color } as CSSProperties)
                    : undefined
            }
        />
    );
}
