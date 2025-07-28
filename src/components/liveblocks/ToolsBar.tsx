import { memo } from 'react';
import PencilButton from './toolsbar/PencilButton';
import SelectionButton from './toolsbar/SelectionButton';
import ShapesSelectionButton from './toolsbar/ShapesSelectionButton';
import ZoomInButton from './toolsbar/ZoomInButton';
import ZoomOutButton from './toolsbar/ZoomOutButton';
import TextButton from './toolsbar/TextButton';
import { CanvasAction } from './reducer/canvas';
import { useTranslations } from 'next-intl';

interface ToolsBarProps {
    canvasState: CanvasType;
    dispatch_canvas: (action: CanvasAction) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    canZoomIn: boolean;
    canZoomOut: boolean;
}

const shapeSelectList: LayerType[] = ['Rectangle', 'Ellipse'];

function ToolsBar({ canvasState, dispatch_canvas, zoomIn, zoomOut, canZoomIn, canZoomOut }: ToolsBarProps) {
    const t = useTranslations('tools');
    const toolListConfig = [
        {
            // use cursor to select layer from layers
            // isActive: canvasState.mode !== 'Pencil',
            isActive: true,
            Component: SelectionButton,
            tips: t('select')
        },
        {
            // select a shape and add a shapeLayer to layers
            isActive: canvasState.mode === 'Inserting' && shapeSelectList.includes(canvasState.layerType),
            Component: ShapesSelectionButton,
            tips: t('select_shape')
        },
        {
            // draw a new pathLayer and insert to layers
            isActive: canvasState.mode === 'Inserting' && canvasState.layerType === 'Path',
            Component: PencilButton,
            tips: t('pencil')
        },
        {
            // input text and add a textLayer to layers
            isActive: canvasState.mode === 'Inserting' && canvasState.layerType === 'Text',
            Component: TextButton,
            tips: t('text')
        }
    ];

    return (
        <div className="fixed bottom-4 left-1/2 z-10 flex translate-x-1/2 items-center justify-center rounded-lg bg-white p-1 shadow-[0_0_3px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-center gap-3">
                {toolListConfig.map(tool => (
                    <tool.Component key={tool.tips} isActive={tool.isActive} dispatch_canvas={dispatch_canvas} canvasState={canvasState} />
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
