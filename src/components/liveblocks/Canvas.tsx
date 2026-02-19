'use client';

import { findIntersectionLayerListWithRectangle } from '@/utils/layer';
import { useHistory, useMutation, useSelf, useStorage } from '@liveblocks/react';
import LayerComponent from './canvas/LayerComponent';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import ToolsBar from './ToolsBar';
import PathLayer from './canvas/PathLayer';
import SelectionBox from './canvas/SelectionBox';
import { cameraReducer, initialCamera } from './reducer/camera';
import { canvasReducer, initialCanvasState } from './reducer/canvas';
import { colorToCss } from '@/utils/common';
import MultiSelectionBox from './canvas/MultiSelectionBox';
import useDrawing from '@/lib/hooks/useDrawing';
import useAddLayer from '@/lib/hooks/useAddLayer';
import usePointer from '@/lib/hooks/usePointer';
import useUpdateLayer from '@/lib/hooks/useUpdateLayer';
import useDeleteLayer from '@/lib/hooks/useDeleteLayer';
import useSelectLayer from '@/lib/hooks/useSelectLayer';
import SelectionTools from './canvas/SelectionTools';
import useLayerList from '@/lib/hooks/useLayerList';
import SideBars from '../sidebars';
import MultiplayerGuides from './canvas/MultiplayerGuides';

const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

interface CanvasProps {
    roomName: string;
    roomId: string;
    othersWithAccessToRoom: User[];
}

export default function Canvas({ roomName, roomId, othersWithAccessToRoom }: CanvasProps) {
    const roomColor = useStorage(storage => storage.roomColor);
    const { layerIds } = useLayerList();
    const pencilDraft = useSelf(self => self.presence.pencilDraft);
    const hasSelectedLayer = useSelf(self => self.presence.selection.length > 0);
    const [camera, dispatch_camera] = useReducer(cameraReducer, initialCamera);
    const [canvasState, dispatch_canvas] = useReducer(canvasReducer, initialCanvasState);
    const history = useHistory();
    const displaySelectionBox = !!(
        (canvasState.mode === 'Translating' ||
            canvasState.mode === 'Resizing' ||
            canvasState.mode === 'None' ||
            canvasState.mode === 'Detailing' ||
            canvasState.mode === 'SelectionNet') &&
        hasSelectedLayer
    );
    const displaySelectionNet = !!(canvasState.mode === 'SelectionNet' && canvasState.origin && canvasState.current);
    const showDraft = !!(canvasState.mode === 'Inserting' && canvasState.layerType === 'Path' && pencilDraft && pencilDraft.length > 0);
    const { insertLayer, insertPath } = useAddLayer(dispatch_canvas);
    const { startDrawing, continueDrawing } = useDrawing({ pencilDraft, canvasState });
    const { translateSelectedLayer, resizeSelectedLayer } = useUpdateLayer({ canvasState });
    const deleteSelectedLayer = useDeleteLayer();
    const { unselectedLayers, selectAllLayers, selectLayer } = useSelectLayer(layerIds || []);
    const updateSelectionNet = useMutation(
        ({ storage, setMyPresence }, current: Point, origin: Point) => {
            if (layerIds) {
                const layerList = storage.get('layers').toImmutable();

                dispatch_canvas({
                    type: 'SET_SELECTION_NET_MODE',
                    payload: {
                        origin,
                        current
                    }
                });
                const idList = findIntersectionLayerListWithRectangle(layerIds, layerList, origin, current);

                setMyPresence({ selection: idList });
            }
        },
        [layerIds]
    );
    const { onPointerDown, onPointerUp, onPointerMove, onPointerLeave } = usePointer({
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
    });

    const onLayerPointerDown = useMutation(
        ({ self }, e: React.PointerEvent, layerId: string) => {
            // avoid trigger onPointerDown
            e.stopPropagation();
            history.pause();
            const selection = self.presence.selection;

            if (e.nativeEvent.button === 2) {
                if (selection.length === 0) {
                    selectLayer(layerId, true);
                }

                dispatch_canvas({ type: 'SET_DETAIL_MODE' });
            } else if (canvasState.mode === 'None' || canvasState.mode === 'Detailing') {
                if (!selection.includes(layerId)) {
                    // add layer to selection and push to history
                    selectLayer(layerId, true);
                }

                dispatch_canvas({ type: 'SET_TRANSITION_MODE' });
            }

            // when select layer, set transition mode and selection box will display and move to this layer

            // const pointer = pointerEventToCanvasPoint(e, camera);
        },
        [canvasState.mode, history]
    );

    //缩放按钮事件
    const onZoom = useMemo(() => {
        function zoomIn() {
            dispatch_camera({ type: 'ZOOM_IN' });
        }

        function zoomOut() {
            dispatch_camera({ type: 'ZOOM_OUT' });
        }

        return {
            zoomIn,
            zoomOut
        };
    }, []);
    //鼠标滚轮事件
    const onWheel = useCallback(
        (e: React.WheelEvent) => {
            // 阻止阈值事件
            if ((camera.zoom === MAX_ZOOM && e.deltaY < 0) || (camera.zoom === MIN_ZOOM && e.deltaY > 0)) {
                return;
            }

            const zoomSpeed = 0.1; // 缩放速度
            const scaleFactor = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed; // 缩放因子
            const newScale = camera.zoom * scaleFactor; // 更新缩放比例

            // 调整平移偏移量，使鼠标位置保持不变
            dispatch_camera({
                type: 'SET_ZOOM',
                payload: {
                    scale: newScale,
                    clientX: e.clientX,
                    clientY: e.clientY
                }
            });
        },
        [camera]
    );

    useEffect(
        function addKeyDownEventListener() {
            function onKeyDown(e: KeyboardEvent) {
                const activeElement = document.activeElement;
                const isInputField = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;

                if (isInputField) {
                    return;
                }

                switch (e.key) {
                    case 'Backspace': {
                        deleteSelectedLayer();
                        break;
                    }

                    case 'z': {
                        if (e.metaKey || e.ctrlKey) {
                            if (e.shiftKey) {
                                history.redo();
                            } else {
                                history.undo();
                            }
                        }

                        break;
                    }

                    case 'a': {
                        if (e.metaKey || e.ctrlKey) {
                            selectAllLayers();
                            dispatch_canvas({ type: 'SET_NONE_MODE' });
                        }

                        break;
                    }
                }
            }

            document.addEventListener('keydown', onKeyDown);

            return () => {
                document.removeEventListener('keydown', onKeyDown);
            };
        },
        [deleteSelectedLayer, history, selectAllLayers]
    );

    return (
        <div>
            <div style={{ backgroundColor: roomColor ? colorToCss(roomColor) : '#1e1e1e' }} className="relative h-screen touch-none">
                <SelectionTools camera={camera} visible={canvasState.mode === 'Detailing'} />
                <svg
                    onPointerMove={onPointerMove}
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerLeave}
                    onWheel={onWheel}
                    onContextMenu={e => e.preventDefault()}
                    className="h-full w-full select-none">
                    <g style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
                        {layerIds?.map(layerId => <LayerComponent key={layerId} id={layerId} onLayerPointerDown={onLayerPointerDown} />)}
                        <MultiplayerGuides />
                        {showDraft && (
                            <PathLayer
                                id="pencil-draft"
                                layer={{
                                    // todo fixed params
                                    type: 'Path',
                                    x: 0,
                                    y: 0,
                                    stroke: { r: 217, g: 217, b: 217 },
                                    fill: { r: 217, g: 217, b: 217 },
                                    opacity: 1,
                                    points: pencilDraft
                                }}
                            />
                        )}
                        <SelectionBox dispatch_canvas={dispatch_canvas} isShow={displaySelectionBox} />
                        <MultiSelectionBox
                            origin={canvasState.mode === 'SelectionNet' ? canvasState.origin : null}
                            current={canvasState.mode === 'SelectionNet' ? canvasState.current || null : null}
                            isShow={displaySelectionNet}
                        />
                    </g>
                </svg>
            </div>

            <ToolsBar
                canvasState={canvasState}
                dispatch_canvas={dispatch_canvas}
                canZoomIn={camera.zoom < MAX_ZOOM}
                canZoomOut={camera.zoom > MIN_ZOOM}
                canRedo={history.canRedo()}
                canUndo={history.canUndo()}
                redo={history.redo}
                undo={history.undo}
                {...onZoom}
            />
            <SideBars roomName={roomName} roomId={roomId} othersWithAccessToRoom={othersWithAccessToRoom} />
        </div>
    );
}
