import { AiOutlineFontSize } from 'react-icons/ai';
import IconButton from './IconButton';

interface TextButtonProps {
    isActive: boolean;
    setCanvasState: (state: CanvasType) => void;
}

export default function TextButton({ isActive, setCanvasState }: TextButtonProps) {
    return (
        <IconButton isActive={isActive} onClick={() => setCanvasState({ mode: 'Inserting', layerType: 'Text' })}>
            <AiOutlineFontSize className="h-5 w-5" />
        </IconButton>
    );
}
