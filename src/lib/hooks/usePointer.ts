import type { CameraAction } from '@/components/liveblocks/reducer/camera';
import type { CanvasAction } from '@/components/liveblocks/reducer/canvas';
import { match } from '@/utils/common';
import { pointerEventToCanvasPoint } from '@/utils/layer';
import { useHistory, useMutation } from '@liveblocks/react';

interface UsePointerProps {
    canvasState: CanvasType;
    camera: Camera;
    insertLayer: (layerType: LayerType, position: Point) => void;
    insertPath: () => void;
    startDrawing: (point: Point, pressure: number) => void;
    continueDrawing: (point: Point, e: React.PointerEvent) => void;
    resizeSelectedLayer: (point: Point) => void;
    translateSelectedLayer: (offset: Point) => void;
    updateSelectionNet: (point: Point, origin: Point) => void;
    unselectedLayers: () => void;
    dispatch_canvas: (action: CanvasAction) => void;
    dispatch_camera: (action: CameraAction) => void;
}

/**
 * Create and return pointer event handlers wired to canvas and camera state for managing drawing, selection, camera movement, and layer operations.
 *
 * @returns An object containing four pointer handlers:
 * - `onPointerUp` — finalizes insertions, finishes drags/resizes/translations, clears selections, and resumes history.
 * - `onPointerDown` — pauses history and starts dragging, path drawing, or pressing-based selection depending on mode.
 * - `onPointerMove` — updates cursor presence and performs camera movement, drawing continuation, resizing, translation, or selection-net updates based on mode.
 * - `onPointerLeave` — clears the presence cursor.
 */
export default function usePointer({
    canvasState,
    camera,
    insertLayer,
    insertPath,
    startDrawing,
    continueDrawing,
    resizeSelectedLayer,
    translateSelectedLayer,
    updateSelectionNet,
    unselectedLayers,
    dispatch_canvas,
    dispatch_camera
}: UsePointerProps) {
    const history = useHistory();
    // cursor click up event
    const onPointerUp = useMutation(
        ({}, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);

            switch (canvasState.mode) {
                case 'Inserting': {
                    // finish insert a new layer
                    if (canvasState.layerType === 'Path') {
                        insertPath();
                    } else {
                        insertLayer(canvasState.layerType, point);
                    }

                    break;
                }

                case 'Dragging': {
                    // finish move camera viewBox
                    dispatch_canvas({ type: 'SET_DRAGGING_MODE', payload: { disabled: true } });
                    break;
                }

                case 'Resizing': {
                    // when click up the layer, finish `RESIZE` to `TRANSITION`
                    dispatch_canvas({ type: 'SET_NONE_MODE' });
                    break;
                }

                case 'None': {
                    // cancel select layer
                    unselectedLayers();
                    break;
                }

                case 'Pressing': {
                    unselectedLayers();
                    dispatch_canvas({ type: 'SET_NONE_MODE' });
                    break;
                }

                case 'Translating': {
                    // when click up the layer, finish `TRANSITION` to `NONE`
                    dispatch_canvas({ type: 'SET_NONE_MODE' });
                    break;
                }

                case 'SelectionNet': {
                    // when click up the layer, finish `TRANSITION` to `NONE`
                    dispatch_canvas({ type: 'SET_NONE_MODE' });
                    break;
                }
            }

            history.resume();
        },
        [history, canvasState, camera]
    );
    // cursor click down event
    const onPointerDown = useMutation(
        ({}, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);

            history.pause();

            match(canvasState)
                .on({ mode: 'Dragging', disabled: true }, () => {
                    dispatch_canvas({ type: 'SET_DRAGGING_MODE', payload: { disabled: false } });
                })
                .on({ mode: 'Inserting', layerType: 'Path' }, () => {
                    startDrawing(point, e.pressure);
                })
                .on({ mode: 'Detailing' }, () => {
                    dispatch_canvas({ type: 'SET_NONE_MODE' });
                })
                .on({ mode: 'None' }, () => {
                    dispatch_canvas({ type: 'SET_PRESSING_MODE', payload: { origin: point } });
                });
        },
        [canvasState, camera]
    );
    // cursor move event
    const onPointerMove = useMutation(
        ({ setMyPresence }, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);
            const deltaX = e.movementX;
            const deltaY = e.movementY;

            match(canvasState)
                .on({ mode: 'Dragging', disabled: false }, () => {
                    dispatch_camera({ type: 'MOVE', payload: { deltaX, deltaY } });
                })
                .on({ mode: 'Inserting', layerType: 'Path' }, () => {
                    continueDrawing(point, e);
                })
                .on({ mode: 'Resizing' }, () => {
                    resizeSelectedLayer(point);
                })
                .on({ mode: 'Translating' }, () => {
                    const offset = { x: e.movementX / camera.zoom, y: e.movementY / camera.zoom };

                    translateSelectedLayer(offset);
                })
                .on({ mode: 'Pressing' }, () => {
                    const origin = (canvasState as { mode: 'Pressing'; origin: Point }).origin;
                    const current = point;

                    if (Math.abs(origin.x - current.x) + Math.abs(origin.y - current.y) > 5) {
                        dispatch_canvas({ type: 'SET_SELECTION_NET_MODE', payload: { origin, current: point } });
                    }

                    // startMultiSelect(point, (canvasState as { mode: 'Pressing'; origin: Point }).origin);
                })
                .on({ mode: 'SelectionNet' }, () => {
                    updateSelectionNet(point, (canvasState as { mode: 'SelectionNet'; origin: Point }).origin);
                });
            setMyPresence({
                cursor: point
            });
        },
        [canvasState, camera, continueDrawing, updateSelectionNet]
    );
    // cursor leave view
    const onPointerLeave = useMutation(({ setMyPresence }) => {
        setMyPresence({
            cursor: null
        });
    }, []);

    return {
        onPointerUp,
        onPointerDown,
        onPointerMove,
        onPointerLeave
    };
}