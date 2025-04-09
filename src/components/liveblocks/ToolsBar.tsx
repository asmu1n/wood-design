import { memo } from 'react';
import PencilButton from './toolsbar/PencilButton';
import SelectionButton from './toolsbar/SelectionButton';
import ShapesSelectionButton from './toolsbar/ShapesSelectionButton';
import ZoomInButton from './toolsbar/ZoomInButton';
import ZoomOutButton from './toolsbar/ZoomOutButton';
import TextButton from './toolsbar/TextButton';

interface ToolsBarProps {
    canvasState: CanvasType;
    setCanvasState: (state: CanvasType) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    canZoomIn: boolean;
    canZoomOut: boolean;
}

const shapeSelectList: LayerType[] = ['Rectangle', 'Ellipse'];

function ToolsBar({ canvasState, setCanvasState, zoomIn, zoomOut, canZoomIn, canZoomOut }: ToolsBarProps) {
    const toolListConfig = [
        {
            isActive: canvasState.mode !== 'Pencil',
            Component: SelectionButton,
            tips: '选择'
        },
        {
            isActive: canvasState.mode === 'Inserting' && shapeSelectList.includes(canvasState.layerType),
            Component: ShapesSelectionButton,
            tips: '选择图形'
        },
        {
            isActive: canvasState.mode === 'Pencil',
            Component: PencilButton,
            tips: '手绘'
        },
        {
            isActive: canvasState.mode === 'Inserting' && canvasState.layerType === 'Text',
            Component: TextButton,
            tips: '插入文本'
        }
    ];

    return (
        <div className="fixed bottom-4 left-1/2 z-10 flex translate-x-1/2 items-center justify-center rounded-lg bg-white p-1 shadow-[0_0_3px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-center gap-3">
                {toolListConfig.map(tool => (
                    <tool.Component key={tool.tips} isActive={tool.isActive} setCanvasState={setCanvasState} canvasState={canvasState} />
                ))}
                <div className="w-0.25 self-stretch bg-black/10"></div>
                <div className="flex items-center justify-center">
                    <ZoomInButton zoomIn={zoomIn} canZoomIn={canZoomIn} />
                    <ZoomOutButton zoomOut={zoomOut} canZoomOut={canZoomOut} />
                </div>
            </div>
        </div>
    );
}

export default memo(ToolsBar);
