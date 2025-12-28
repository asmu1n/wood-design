import Dialog from '../Dialog';
import { Button } from '../ui/button';
import { DialogClose } from '../ui/dialog';

interface ConfirmationModalProps {
    isOpen: boolean;
    onSetOpen: (value: boolean) => void;
    onConfirm: () => void;
    message: string;
}

function ConfirmationModal({ isOpen, onSetOpen, onConfirm, message }: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} setOpen={onSetOpen} footer={<ConfirmFooter onConfirm={onConfirm} />}>
            {message}
        </Dialog>
    );
}

interface ConfirmFooterProps {
    onConfirm: () => void;
}

function ConfirmFooter({ onConfirm }: ConfirmFooterProps) {
    return (
        <>
            <DialogClose asChild>
                <Button>Cancel</Button>
            </DialogClose>
            <Button onClick={onConfirm}>Confirm</Button>
        </>
    );
}

export default ConfirmationModal;
