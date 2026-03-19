import { type JSX } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    label: string;
    onChange: (files: FileList | null) => void;
    accept?: string;
    className?: string;
}

export default function FileInput({
    label,
    onChange,
    accept,
    className,
}: Props): JSX.Element {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label className="text-sm font-medium text-foreground">
                {label}
            </label>
            <input
                type="file"
                accept={accept}
                onChange={(e) => onChange(e.target.files)}
                className="flex h-9 w-full cursor-pointer rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
        </div>
    );
}
