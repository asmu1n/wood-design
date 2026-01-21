import IconButton from './IconButton';

/**
 * Renders an undo action button.
 *
 * Renders an IconButton that displays an inline SVG undo icon and forwards the provided click handler and disabled state.
 *
 * @param onClick - Callback invoked when the button is clicked.
 * @param disabled - If true, the button is rendered in a disabled, non-interactive state.
 * @returns A JSX element representing the undo button.
 */
export default function UndoButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
    return (
        <IconButton onClick={onClick} disabled={disabled}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M15 16H21C22.654 16 24 17.346 24 19C24 20.654 22.654 22 21 22H18V24H21C23.757 24 26 21.757 26 19C26 16.243 23.757 14 21 14H15V11L10 15L15 19V16Z"
                    fill="#888888"
                />
            </svg>
        </IconButton>
    );
}