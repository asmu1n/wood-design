import { AiOutlineZoomOut } from 'react-icons/ai';
import IconButton from './IconButton';

interface ZoomOutButtonProps {
    zoomOut: () => void;
    canZoomOut: boolean;
}

export default function ZoomOutButton({ zoomOut, canZoomOut }: ZoomOutButtonProps) {
    return (
        <IconButton onClick={zoomOut} disabled={!canZoomOut}>
            <AiOutlineZoomOut className="h-5 w-5" size={32} color="#888888" />
        </IconButton>
    );
}
