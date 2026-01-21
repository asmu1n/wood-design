import { cn } from '@/utils/common';

/**
 * Renders a circular user avatar showing the first uppercase character of `name`.
 *
 * The avatar's background color is `color` if provided, otherwise `#3b82f6`. Additional CSS classes can be merged via `className`.
 *
 * @param name - The display name used to derive the avatar character; the first character (uppercased) is shown, or an empty string if `name` is empty.
 * @param color - Optional background color for the avatar.
 * @param className - Optional additional CSS class names to apply to the avatar container.
 * @returns The avatar element containing the first uppercase character of `name`, or an empty string if `name` is empty.
 */
export default function UserAvatar({ name, color, className = '' }: { name: string; color?: string; className?: string }) {
    return (
        <div
            className={cn('flex min-h-6 min-w-6 items-center justify-center rounded-full text-xs text-white', className)}
            style={{ backgroundColor: color ? color : '#3b82f6' }}>
            {name.length >= 1 ? name[0]?.toUpperCase() : ''}
        </div>
    );
}