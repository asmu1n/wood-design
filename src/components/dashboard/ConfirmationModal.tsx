import Dialog from '../Dialog';
import { Button } from '../ui/button';
import { DialogClose } from '../ui/dialog';
import { useTranslations } from 'next-intl';

interface ConfirmationModalProps {
    isOpen: boolean;
    onSetOpen: (value: boolean) => void;
    onConfirm: () => void;
    message: string;
}

function ConfirmationModal({ isOpen, onSetOpen, onConfirm, message }: ConfirmationModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <Dialog open={isOpen} onUpdateOpenState={onSetOpen} footer={<ConfirmFooter onConfirm={onConfirm} />}>
            {message}
        </Dialog>
    );
}

interface ConfirmFooterProps {
    onConfirm: () => void;
}

function ConfirmFooter({ onConfirm }: ConfirmFooterProps) {
    const t = useTranslations();

    return (
        <>
            <DialogClose asChild>
                <Button>{t('common.cancel')}</Button>
            </DialogClose>
            <Button onClick={onConfirm}>{t('common.confirm')}</Button>
        </>
    );
}

export default ConfirmationModal;
