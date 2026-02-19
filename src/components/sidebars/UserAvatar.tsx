import { cn } from '@/utils/common';

export default function UserAvatar({ name, color, className = '' }: { name: string; color?: string; className?: string }) {
    return (
        <div
            className={cn('flex min-h-6 min-w-6 items-center justify-center rounded-full text-xs text-white', className)}
            style={{ backgroundColor: color ? color : '#3b82f6' }}>
            {name.length >= 1 ? name[0]?.toUpperCase() : ''}
        </div>
    );
}
