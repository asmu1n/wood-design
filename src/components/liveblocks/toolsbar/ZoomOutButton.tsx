import { AiOutlineZoomOut } from 'react-icons/ai';
import IconButton from './IconButton';

interface ZoomOutButtonProps {
    onClick: () => void;
    disabled: boolean;
}

/**
 * Renders a zoom-out icon button that calls the provided handler when activated.
 *
 * @param onClick - Callback invoked when the button is clicked (if not disabled).
 * @param disabled - Whether the button is disabled and non-interactive.
 * @returns The rendered IconButton element containing a zoom-out icon.
 */
export default function ZoomOutButton({ onClick, disabled }: ZoomOutButtonProps) {
    return (
        <IconButton onClick={onClick} disabled={disabled}>
            <AiOutlineZoomOut className="h-5 w-5" size={32} color="#888888" />
        </IconButton>
    );
}