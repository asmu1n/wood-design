import { Popover, PopoverContent, PopoverTrigger, Close, Portal, Arrow } from '@radix-ui/react-popover';
import { Button } from './ui/button';
import { useTranslations } from 'next-intl';

interface PopoverConfirmProps {
    confirmText?: string;
    // cancelText?: string;
    children?: React.ReactNode;
    title?: string;
    trigger?: React.ReactNode;
    displayClose?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
}

/**
 * Renders a confirmation popover anchored to a provided trigger element.
 *
 * Renders optional title, close control, custom content, and a destructive confirm button. The confirm button label uses `confirmText` when provided or falls back to the translated "confirm" text.
 *
 * @param confirmText - Optional label to display on the confirm button; overrides the default translated label.
 * @param children - Content to render inside the popover body.
 * @param title - Optional heading text shown at the top of the popover.
 * @param trigger - Element used as the popover trigger; rendered as the trigger child.
 * @param displayClose - When true, shows a close control in the popover header that calls `onCancel` when clicked.
 * @param onConfirm - Optional handler invoked when the confirm button is clicked; the confirm button is rendered only when this handler is provided.
 * @param onCancel - Optional handler invoked when the close control is clicked.
 * @returns A React element that displays the configured confirmation popover.
 */
export default function PopoverConfirm({ confirmText, children, title, trigger, displayClose, onConfirm, onCancel }: PopoverConfirmProps) {
    const t = useTranslations('common');

    return (
        <Popover>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <Portal>
                <PopoverContent>
                    <div className="relative flex flex-col gap-2 rounded-lg bg-slate-50 p-4 shadow-[5px_4px_6px_3px_rgba(0,0,0,0.15)]">
                        {title && <h3 className="text-lg font-medium">{title}</h3>}
                        {displayClose && (
                            <Close className="PopoverClose absolute top-1 right-1.5 text-slate-500" aria-label="Close" onClick={onCancel}>
                                X
                            </Close>
                        )}
                        <Arrow className="PopoverArrow" />
                        <div>{children}</div>
                        {onConfirm && (
                            <Button type="destructive" className="w-20 max-w-fit px-3 py-1" onClick={onConfirm}>
                                {confirmText || t('confirm')}
                            </Button>
                        )}
                    </div>
                </PopoverContent>
            </Portal>
        </Popover>
    );
}