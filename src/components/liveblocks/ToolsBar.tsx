import SelectionButton from './toolsbar/SelectionButton';
import ShapesSelectionButton from './toolsbar/ShapesSelectionButton';

interface ToolsBarProps {
    canvasState: CanvasType;
    setCanvasState: (state: CanvasType) => void;
}

const shapeSelectList: LayerType[] = ['Rectangle', 'Ellipse'];

export default function ToolsBar({ canvasState, setCanvasState }: ToolsBarProps) {
    return (
        <div className="fixed bottom-4 left-1/2 z-10 flex translate-x-1/2 items-center justify-center rounded-lg bg-white p-1 shadow-[0_0_3px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-center gap-3">
                <SelectionButton isActive={canvasState.mode !== 'Inserting'} canvasMode={canvasState.mode} setCanvasState={setCanvasState} />
                <ShapesSelectionButton
                    isActive={canvasState.mode === 'Inserting' && shapeSelectList.includes(canvasState.layerType)}
                    CanvasState={canvasState}
                    setCanvasState={setCanvasState}
                />
            </div>
        </div>
    );
}
