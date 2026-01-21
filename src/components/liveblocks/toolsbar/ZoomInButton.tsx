import IconButton from './IconButton';
import { AiOutlineZoomIn } from 'react-icons/ai';

interface ZoomInButtonProps {
    onClick: () => void;
    disabled: boolean;
}

/**
 * Renders a zoom-in icon button for the LiveBlocks toolbar.
 *
 * @param onClick - Callback invoked when the button is clicked
 * @param disabled - If true, the button is disabled and not interactive
 * @returns The ZoomIn toolbar button element
 */
export default function ZoomInButton({ onClick, disabled }: ZoomInButtonProps) {
    return (
        <IconButton onClick={onClick} disabled={disabled}>
            <AiOutlineZoomIn className="h-5 w-5" size={32} color="#888888" />
        </IconButton>
    );
}