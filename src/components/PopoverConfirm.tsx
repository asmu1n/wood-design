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
