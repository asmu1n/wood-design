'use client';

import { checkPointerButton, penPointsToPath, pointerEventToCanvasPoint, resizeBounds } from '@/utils/layer';
import { useMutation, useSelf, useStorage } from '@liveblocks/react';
import LayerComponent from './canvas/LayerComponent';
import { nanoid } from 'nanoid';
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client';
import { useCallback, useMemo, useReducer } from 'react';
import ToolsBar from './ToolsBar';
import PathLayer from './canvas/PathLayer';
import SelectionBox from './canvas/SelectionBox';
import { cameraReducer, initialCamera } from './reducer/camera';
import { canvasReducer, initialCanvasState } from './reducer/canvas';
import { _, colorToCss, match } from '@/utils/common';

const MAX_LAYERS = 100;

const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

function createLayer(
    {
        storage,
        setMyPresence
    }: {
        storage: LiveObject<{
            roomColor: Color | null;
            layers: LiveMap<string, LiveObject<Layer>>;
            layerIds: LiveList<string>;
        }>;
        setMyPresence: (
            patch: Partial<{
                selection: string[];
                cursor: Point | null;
                penColor: Color | null;
                pencilDraft: [x: number, y: number, pressure: number][] | null;
            }>,
            options?: {
                addToHistory: boolean;
            }
        ) => void;
    },
    layerType: LayerType,
    position: Point
) {
    const liveLayers = storage.get('layers');

    if (liveLayers.size >= MAX_LAYERS) {
        return;
    }

    const liveLayerIds = storage.get('layerIds');
    const layerId = nanoid();
    let layer: LiveObject<Layer> | null = null;

    switch (layerType) {
        case 'Rectangle': {
            layer = new LiveObject<Layer>({
                type: 'Rectangle',
                x: position.x,
                y: position.y,
                height: 100,
                width: 100,
                stroke: { r: 217, g: 217, b: 217 },
                fill: { r: 217, g: 217, b: 217 },
                opacity: 1
            });
            break;
        }

        case 'Ellipse': {
            layer = new LiveObject<Layer>({
                type: 'Ellipse',
                x: position.x,
                y: position.y,
                height: 100,
                width: 100,
                stroke: { r: 217, g: 217, b: 217 },
                fill: { r: 217, g: 217, b: 217 },
                opacity: 1
            });
            break;
        }

        case 'Text': {
            layer = new LiveObject<Layer>({
                type: 'Text',
                x: position.x,
                y: position.y,
                text: 'Test',
                fontSize: 16,
                width: 100,
                height: 100,
                fontFamily: 'Arial',
                fontWeight: 400,
                lineHeight: 1.5,
                textAlign: 'left',
                stroke: { r: 217, g: 217, b: 217 },
                fill: { r: 217, g: 217, b: 217 },
                opacity: 1
            });
            break;
        }
    }

    if (layer) {
        liveLayers.set(layerId, layer);
        liveLayerIds.push(layerId);
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
    }
}

export default function Canvas() {
    const roomColor = useStorage(storage => storage.roomColor);
    const layerIds = useStorage(storage => storage.layerIds);
    const pencilDraft = useSelf(self => self.presence.pencilDraft);
    const [camera, dispatch_camera] = useReducer(cameraReducer, initialCamera);
    const [canvasState, dispatch_canvas] = useReducer(canvasReducer, initialCanvasState);
    const displaySelectionBox = canvasState.mode === 'Translating' || canvasState.mode === 'Resizing';
    // const setMyPresence = useMyPresence();

    // insert layer
    const insertLayer = useMutation(createLayer, []);

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

    const startDrawing = useMutation(({ setMyPresence }, point: Point, pressure: number) => {
        setMyPresence({ pencilDraft: [[point.x, point.y, pressure]], penColor: { r: 217, g: 217, b: 217 } }, { addToHistory: true });
    }, []);

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

            liveLayers.set(layerId, new LiveObject(penPointsToPath(pencilDraft, { r: 217, g: 217, b: 217 })));
            const liveLayerIds = storage.get('layerIds');

            liveLayerIds.push(layerId);
            dispatch_canvas({ type: 'SET_NONE_MODE' });
            dispatch_canvas({ type: 'SET_PENCIL_DRAFT', payload: null });
            setMyPresence({ pencilDraft: null }, { addToHistory: true });
        } else {
            dispatch_canvas({ type: 'SET_NONE_MODE' });
            dispatch_canvas({ type: 'SET_PENCIL_DRAFT', payload: null });
            setMyPresence({ pencilDraft: null }, { addToHistory: true });
        }
    }, []);

    // cursor click up event
    const onPointerUp = useMutation(
        ({}, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);

            switch (canvasState.mode) {
                case 'Inserting': {
                    insertLayer(canvasState.layerType, point);
                    break;
                }

                case 'Dragging': {
                    dispatch_canvas({ type: 'SET_DRAGGING_MODE', payload: { origin: null } });
                    break;
                }

                case 'Inserting': {
                    if (canvasState.layerType === 'Path') {
                        insertPath();
                    }

                    break;
                }

                // case 'Resizing': {
                //     // when click up the layer, finish `RESIZE` to `TRANSITION`
                //     dispatch_canvas({ type: 'SET_TRANSITION_MODE', payload: { point } });
                //     break;
                // }

                case 'None': {
                    unselectedLayers();
                    dispatch_canvas({ type: 'SET_NONE_MODE' });
                    break;
                }
            }
        },
        [insertLayer, canvasState, camera]
    );

    // cursor click down event
    const onPointerDown = useMutation(
        ({}, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);

            switch (canvasState.mode) {
                case 'Dragging': {
                    dispatch_canvas({ type: 'SET_DRAGGING_MODE', payload: { origin: point } });
                    break;
                }

                case 'Inserting': {
                    if (canvasState.layerType === 'Path') {
                        startDrawing(point, e.pressure);
                    }

                    break;
                }
            }
        },
        [canvasState, camera]
    );

    // cursor move event
    const onPointerMove = useMutation(
        ({}, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);

            match(canvasState)
                .on({ mode: 'Dragging', origin: _ }, () => {
                    const deltaX = e.movementX;
                    const deltaY = e.movementY;

                    dispatch_camera({ type: 'MOVE', payload: { deltaX, deltaY } });
                })
                .on({ mode: 'Inserting', layerType: 'Path' }, () => {
                    continueDrawing(point, e);
                })
                .on({ mode: 'Resizing' }, () => {
                    resizeSelectedLayer(point);
                });

            // switch (canvasState.mode) {
            //     case 'Dragging': {
            //         if (canvasState.origin) {
            //             const deltaX = e.movementX;
            //             const deltaY = e.movementY;

            //             dispatch_camera({ type: 'MOVE', payload: { deltaX, deltaY } });
            //         }

            //         break;
            //     }

            //     case 'Inserting': {
            //         if (canvasState.layerType === 'Path') {
            //             continueDrawing(point, e);
            //         }

            //         break;
            //     }

            //     case 'Resizing': {
            //         resizeSelectedLayer(point);
            //         break;
            //     }
            // }
        },
        [canvasState, camera, continueDrawing]
    );
    // layer select event
    const onLayerPointerDown = useMutation(
        ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
            e.stopPropagation();

            if (canvasState.mode === 'Dragging' || canvasState.mode === 'None' || canvasState.mode === 'Translating') {
                if (!self.presence.selection.includes(layerId)) {
                    setMyPresence({ selection: [layerId] }, { addToHistory: true });
                }
            }

            // when select layer, set transition mode and selection box will display and move to this layer
            const pointer = pointerEventToCanvasPoint(e, camera);

            dispatch_canvas({ type: 'SET_TRANSITION_MODE', payload: { point: pointer } });
        },
        [canvasState.mode, canvasState]
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
            let newScale = camera.zoom * scaleFactor; // 更新缩放比例

            // 限制缩放范围,新值超过范围时直接设置到边界
            if (newScale < MIN_ZOOM || newScale > MAX_ZOOM) {
                newScale = newScale < MIN_ZOOM ? MIN_ZOOM : MAX_ZOOM;
            }

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
                    onWheel={onWheel}
                    className="h-full w-full">
                    <g style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
                        {layerIds?.map(layerId => <LayerComponent key={layerId} id={layerId} onLayerPointerDown={onLayerPointerDown} />)}
                        {canvasState.mode === 'Inserting' && canvasState.layerType === 'Path' && pencilDraft && pencilDraft.length > 0 && (
                            <PathLayer
                                id="pencil-draft"
                                layer={{
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
                        {displaySelectionBox && <SelectionBox dispatch_canvas={dispatch_canvas} />}
                    </g>
                </svg>
            </div>
            <ToolsBar
                canvasState={canvasState}
                dispatch_canvas={dispatch_canvas}
                canZoomIn={camera.zoom < MAX_ZOOM}
                canZoomOut={camera.zoom > MIN_ZOOM}
                {...onZoom}
            />
        </div>
    );
}
