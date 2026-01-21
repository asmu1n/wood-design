import {
    Dialog as DialogPrimitive,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';

interface DialogProps<T> {
    open?: T;
    onUpdateOpenState?: T extends boolean ? (value: boolean) => void : never;
    trigger?: T extends boolean ? never : React.ReactNode;
    title?: string;
    description?: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Render a configurable dialog composed from DialogPrimitive and its primitives.
 *
 * Renders an optional trigger, title, description, main content, and optional footer. When both `open` and `onUpdateOpenState` are provided the dialog is controlled; otherwise it uses the trigger for opening.
 *
 * @template T - Controls whether the dialog is controlled (`boolean`) or uncontrolled (`undefined`).
 * @param trigger - Element used as the dialog trigger when not using a controlled `open` prop.
 * @param title - Dialog title text.
 * @param description - Optional dialog description text.
 * @param open - Controlled open state; provide together with `onUpdateOpenState` to control visibility.
 * @param onUpdateOpenState - Callback invoked with the new open state when controlling the dialog.
 * @param children - Main dialog content.
 * @param footer - Optional footer content rendered in the dialog footer.
 * @returns A React element representing the configured dialog.
 */
function Dialog<T extends boolean | undefined>({ trigger, title, description, open, children, footer, onUpdateOpenState }: DialogProps<T>) {
    const propsControl = open && onUpdateOpenState ? { open, onOpenChange: onUpdateOpenState } : {};

    return (
        <DialogPrimitive {...propsControl}>
            {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                {children}
                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </DialogPrimitive>
    );
}

export default Dialog;