'use client';

import { checkPointerButton, findIntersectionLayerListWithRectangle, penPointsToPath, pointerEventToCanvasPoint, resizeBounds } from '@/utils/layer';
import { useHistory, useMutation, useSelf, useStorage } from '@liveblocks/react';
import LayerComponent from './canvas/LayerComponent';
import { nanoid } from 'nanoid';
import { LiveObject } from '@liveblocks/client';
import { useCallback, useMemo, useReducer } from 'react';
import ToolsBar from './ToolsBar';
import PathLayer from './canvas/PathLayer';
import SelectionBox from './canvas/SelectionBox';
import { cameraReducer, initialCamera } from './reducer/camera';
import { canvasReducer, initialCanvasState } from './reducer/canvas';
import { _, colorToCss, match } from '@/utils/common';
import { MAX_LAYERS, createLayer, setLiveLayer } from './canvas/layerOperations';
import MultiSelectionBox from './canvas/MultiSelectionBox';

const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

export default function Canvas() {
    const roomColor = useStorage(storage => storage.roomColor);
    const layerIds = useStorage(storage => storage.layerIds);
    const pencilDraft = useSelf(self => self.presence.pencilDraft);
    const selectedLayerId = useSelf(self => (self.presence.selection.length === 1 ? self.presence.selection[0] : null));
    const [camera, dispatch_camera] = useReducer(cameraReducer, initialCamera);
    const [canvasState, dispatch_canvas] = useReducer(canvasReducer, initialCanvasState);
    const history = useHistory();
    const displaySelectionBox = !!(
        (canvasState.mode === 'Translating' || canvasState.mode === 'Resizing' || canvasState.mode === 'None') &&
        selectedLayerId
    );
    const displaySelectionNet = !!(canvasState.mode === 'SelectionNet' && canvasState.origin && canvasState.current);
    const showDraft = canvasState.mode === 'Inserting' && canvasState.layerType === 'Path' && pencilDraft && pencilDraft.length > 0;

    // insert layer
    const insertLayer = useMutation(createLayer, []);

    // translate selected layer
    const translateSelectedLayer = useMutation(
        ({ storage, self }, offset: { x: number; y: number }) => {
            if (canvasState.mode !== 'Translating') {
                return;
            }

            for (const selectedId of self.presence.selection) {
                const selectedLayer = storage.get('layers').get(selectedId);

                if (selectedLayer) {
                    selectedLayer.update({ x: selectedLayer.get('x') + offset.x, y: selectedLayer.get('y') + offset.y });
                }
            }
        },
        [canvasState]
    );

    // select layer to resize
    const resizeSelectedLayer = useMutation(
        ({ storage, self }, point: Point) => {
            if (canvasState.mode !== 'Resizing') {
                return;
            }

            const bounds = resizeBounds(canvasState.initialBounds, canvasState.corner, point);
            // update layers to set the new  width and height of the layer
            const selectedLayer = storage.get('layers').get(self.presence.selection[0]);

            if (selectedLayer) {
                selectedLayer.update(bounds);
            }
        },
        [canvasState]
    );

    // unselect layers
    const unselectedLayers = useMutation(({ self, setMyPresence }) => {
        if (self.presence.selection.length > 0) {
            setMyPresence({ selection: [] });
        }
    }, []);

    // start drawing path
    const startDrawing = useMutation(
        ({ setMyPresence }, point: Point, pressure: number) => {
            setMyPresence({ pencilDraft: [[point.x, point.y, pressure]], penColor: { r: 217, g: 217, b: 217 } }, { addToHistory: true });
        },
        [history]
    );

    // continue drawing path
    const continueDrawing = useMutation(
        ({ setMyPresence, self }, point: Point, e: React.PointerEvent) => {
            const { pencilDraft } = self.presence;

            if (canvasState.mode === 'Inserting' && canvasState.layerType === 'Path' && pencilDraft && checkPointerButton(e) === 'left') {
                setMyPresence({
                    pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
                    penColor: { r: 217, g: 217, b: 217 }
                });
            }
        },
        [pencilDraft, canvasState.mode]
    );

    const insertPath = useMutation(({ storage, self, setMyPresence }) => {
        const liveLayers = storage.get('layers');
        const { pencilDraft } = self.presence;

        if (pencilDraft && pencilDraft.length > 1 && liveLayers.size < MAX_LAYERS) {
            const layerId = nanoid();

            setLiveLayer(storage, layerId, new LiveObject(penPointsToPath(pencilDraft, { r: 217, g: 217, b: 217 })));
            // dispatch_canvas({ type: 'SET_PENCIL_DRAFT', payload: null });
            setMyPresence({ pencilDraft: null }, { addToHistory: true });
        } else {
            // dispatch_canvas({ type: 'SET_PENCIL_DRAFT', payload: null });
            setMyPresence({ pencilDraft: null }, { addToHistory: true });
        }
    }, []);

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
                    break;
                }

                case 'Translating': {
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
                .on(_, () => {
                    dispatch_canvas({ type: 'SET_PRESSING_MODE', payload: { origin: point } });
                });
        },
        [canvasState, camera]
    );

    const onLayerPointerDown = useMutation(
        ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
            e.stopPropagation();
            history.pause();

            if (canvasState.mode === 'None') {
                if (!self.presence.selection.includes(layerId)) {
                    // add layer to selection and push to history
                    setMyPresence({ selection: [layerId] }, { addToHistory: true });
                }

                dispatch_canvas({ type: 'SET_TRANSITION_MODE' });
            }

            // when select layer, set transition mode and selection box will display and move to this layer

            // const pointer = pointerEventToCanvasPoint(e, camera);
        },
        [canvasState.mode, history]
    );

    // start multi select
    // const startMultiSelect = useCallback((current: Point, origin: Point) => {
    //     if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
    //         dispatch_canvas({ type: 'SET_SELECTION_NET_MODE', payload: { origin, current } });
    //     }
    // }, []);

    // update selection net
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

    // cursor move event
    const onPointerMove = useMutation(
        ({}, e: React.PointerEvent) => {
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

                    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) {
                        dispatch_canvas({ type: 'SET_SELECTION_NET_MODE', payload: { origin, current: point } });
                    }
                    // startMultiSelect(point, (canvasState as { mode: 'Pressing'; origin: Point }).origin);
                })
                .on({ mode: 'SelectionNet' }, () => {
                    updateSelectionNet(point, (canvasState as { mode: 'SelectionNet'; origin: Point }).origin);
                });
        },
        [canvasState, camera, continueDrawing, updateSelectionNet]
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

    return (
        <div>
            <div style={{ backgroundColor: roomColor ? colorToCss(roomColor) : '#1e1e1e' }} className="h-screen touch-none">
                <svg
                    onPointerMove={onPointerMove}
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    // onDoubleClick={onDoubleClick}
                    onWheel={onWheel}
                    className="h-full w-full select-none">
                    <g style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
                        {layerIds?.map(layerId => <LayerComponent key={layerId} id={layerId} onLayerPointerDown={onLayerPointerDown} />)}
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
        </div>
    );
}
