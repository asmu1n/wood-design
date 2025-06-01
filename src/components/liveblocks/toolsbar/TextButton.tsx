import { AiOutlineFontSize } from 'react-icons/ai';
import IconButton from './IconButton';
import { CanvasAction } from '../reducer/canvas';

interface TextButtonProps {
    isActive: boolean;
    dispatch_canvas: (action: CanvasAction) => void;
}

export default function TextButton({ isActive, dispatch_canvas }: TextButtonProps) {
    return (
        <IconButton isActive={isActive} onClick={() => dispatch_canvas({ type: 'SET_INSERT_MODE', payload: { layerType: 'Text' } })}>
            <AiOutlineFontSize className="h-5 w-5" />
        </IconButton>
    );
}
