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
