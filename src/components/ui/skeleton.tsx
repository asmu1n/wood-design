import { cn } from '@/utils/common';

/**
 * Renders a pulsing skeleton placeholder element for use as a loading placeholder.
 *
 * Combines a set of base styling classes with an optional `className` and forwards any other div attributes.
 *
 * @param className - Additional CSS class names to merge with the component's base classes
 * @param props - Other HTML div attributes forwarded to the root element
 * @returns A div element styled as a pulsing skeleton placeholder
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('bg-primary/10 animate-pulse rounded-md', className)} {...props} />;
}

export { Skeleton };