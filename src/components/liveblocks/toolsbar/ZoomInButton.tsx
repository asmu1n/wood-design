import IconButton from './IconButton';
import { AiOutlineZoomIn } from 'react-icons/ai';

interface ZoomInButtonProps {
    zoomIn: () => void;
    canZoomIn: boolean;
}

export default function ZoomInButton({ zoomIn, canZoomIn }: ZoomInButtonProps) {
    return (
        <IconButton onClick={zoomIn} disabled={!canZoomIn}>
            <AiOutlineZoomIn className="h-5 w-5" size={32} color="#888888" />
        </IconButton>
    );
}
