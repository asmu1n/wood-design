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

/**
 * Render a confirmation modal dialog when `isOpen` is true.
 *
 * @param isOpen - Whether the modal is visible
 * @param onSetOpen - Callback invoked with the new open state to update the parent component
 * @param onConfirm - Callback invoked when the user confirms the action
 * @param message - Message content displayed inside the modal
 * @returns The modal React element when open, or `null` when closed
 */
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

/**
 * Render footer actions for a confirmation dialog.
 *
 * Renders a cancel button that closes the dialog and a confirm button that invokes the provided callback.
 *
 * @param onConfirm - Callback invoked when the confirm button is clicked
 * @returns JSX elements for the dialog footer actions
 */
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