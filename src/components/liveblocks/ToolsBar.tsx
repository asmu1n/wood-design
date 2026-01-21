import { memo } from 'react';
import PencilButton from './toolsbar/PencilButton';
import SelectionButton from './toolsbar/SelectionButton';
import ShapesSelectionButton from './toolsbar/ShapesSelectionButton';
import ZoomInButton from './toolsbar/ZoomInButton';
import ZoomOutButton from './toolsbar/ZoomOutButton';
import TextButton from './toolsbar/TextButton';
import { CanvasAction } from './reducer/canvas';
import { useTranslations } from 'next-intl';
import UndoButton from './toolsbar/UndoButton';
import RedoButton from './toolsbar/ReDoButton';

interface ToolsBarProps {
    canvasState: CanvasType;
    dispatch_canvas: (action: CanvasAction) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    canZoomIn: boolean;
    canZoomOut: boolean;
    canRedo: boolean;
    canUndo: boolean;
    redo: () => void;
    undo: () => void;
}

const shapeSelectList: LayerType[] = ['Rectangle', 'Ellipse'];

/**
 * Render the floating tools toolbar that displays canvas tool buttons and grouped operation controls.
 *
 * @param canvasState - Current canvas state used to determine active tool and layer type
 * @param dispatch_canvas - Dispatcher for canvas actions
 * @param zoomIn - Handler to increase canvas zoom
 * @param zoomOut - Handler to decrease canvas zoom
 * @param canZoomIn - Whether zoom-in is currently allowed
 * @param canZoomOut - Whether zoom-out is currently allowed
 * @param canRedo - Whether redo is currently available
 * @param canUndo - Whether undo is currently available
 * @param redo - Handler to perform redo
 * @param undo - Handler to perform undo
 * @returns The toolbar JSX element containing tool buttons and grouped undo/redo and zoom controls
 */
function ToolsBar({ canvasState, dispatch_canvas, zoomIn, zoomOut, canZoomIn, canZoomOut, canRedo, canUndo, redo, undo }: ToolsBarProps) {
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
                <div className="flex items-center justify-center">
                    <OperationButtonList>
                        <UndoButton onClick={undo} disabled={!canUndo} />
                        <RedoButton onClick={redo} disabled={!canRedo} />
                    </OperationButtonList>
                    <OperationButtonList>
                        <ZoomInButton onClick={zoomIn} disabled={!canZoomIn} />
                        <ZoomOutButton onClick={zoomOut} disabled={!canZoomOut} />
                    </OperationButtonList>
                </div>
            </div>
        </div>
    );
}

/**
 * Renders a horizontal container for grouped operation buttons with a left separator.
 *
 * @param children - The button elements to render inside the group
 * @returns The wrapper div element that arranges `children` horizontally and adds a left border
 */
function OperationButtonList({ children }: { children: React.ReactNode }) {
    return <div className="flex items-center justify-center border-l-[1px] border-black/10">{children}</div>;
}

export default memo(ToolsBar);