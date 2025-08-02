import { AiOutlineZoomOut } from 'react-icons/ai';
import IconButton from './IconButton';

interface ZoomOutButtonProps {
    onClick: () => void;
    disabled: boolean;
}

export default function ZoomOutButton({ onClick, disabled }: ZoomOutButtonProps) {
    return (
        <IconButton onClick={onClick} disabled={disabled}>
            <AiOutlineZoomOut className="h-5 w-5" size={32} color="#888888" />
        </IconButton>
    );
}
