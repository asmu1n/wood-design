import IconButton from './IconButton';
import { AiOutlineZoomIn } from 'react-icons/ai';

interface ZoomInButtonProps {
    onClick: () => void;
    disabled: boolean;
}

export default function ZoomInButton({ onClick, disabled }: ZoomInButtonProps) {
    return (
        <IconButton onClick={onClick} disabled={disabled}>
            <AiOutlineZoomIn className="h-5 w-5" size={32} color="#888888" />
        </IconButton>
    );
}
