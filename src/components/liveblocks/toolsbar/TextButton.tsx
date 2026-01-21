import { AiOutlineFontSize } from 'react-icons/ai';
import IconButton from './IconButton';
import { CanvasAction } from '../reducer/canvas';

interface TextButtonProps {
    isActive: boolean;
    dispatch_canvas: (action: CanvasAction) => void;
}

/**
 * Render a toolbar button that activates the canvas text-insert mode when clicked.
 *
 * @param isActive - Whether the button is visually active
 * @param dispatch_canvas - Dispatcher invoked with a `SET_INSERT_MODE` action whose payload sets `layerType` to `"Text"`
 * @returns The IconButton element for toggling text insert mode
 */
export default function TextButton({ isActive, dispatch_canvas }: TextButtonProps) {
    return (
        <IconButton isActive={isActive} onClick={() => dispatch_canvas({ type: 'SET_INSERT_MODE', payload: { layerType: 'Text' } })}>
            <AiOutlineFontSize className="h-5 w-5" />
        </IconButton>
    );
}