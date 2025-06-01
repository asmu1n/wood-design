'use client';

import { checkPointerButton, colorToCss, penPointsToPath, pointerEventToCanvasPoint } from '@/lib/utils';
import { useMutation, useSelf, useStorage } from '@liveblocks/react';
import LayerComponent from './canvas/LayerComponent';
import { nanoid } from 'nanoid';
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client';
import { useCallback, useMemo, useReducer } from 'react';
import ToolsBar from './ToolsBar';
import PathLayer from './canvas/PathLayer';
import SelectionBox from './canvas/SelectionBox';
import { cameraReducer, getInitialCamera } from './reducer/camera';
import { canvasReducer, getInitialCanvasState } from './reducer/canvas';

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
    const [camera, dispatch_camera] = useReducer(cameraReducer, getInitialCamera());
    const [canvasState, dispatch_canvas] = useReducer(canvasReducer, getInitialCanvasState());
    // const setMyPresence = useMyPresence();

    // 插入图层
    const insertLayer = useMutation(createLayer, []);

    //TODO
    const resizeSelectedLayer = useMutation(({ storage, self }, point: Point) => {}, []);

    const startDrawing = useMutation(({ setMyPresence }, point: Point, pressure: number) => {
        setMyPresence({ pencilDraft: [[point.x, point.y, pressure]], penColor: { r: 217, g: 217, b: 217 } }, { addToHistory: true });
    }, []);

    // 继续绘制路径
    const continueDrawing = useMutation(
        ({ setMyPresence, self }, point: Point, e: React.PointerEvent) => {
            const { pencilDraft } = self.presence;

            if (canvasState.mode === 'Pencil' && pencilDraft && checkPointerButton(e) === 'left') {
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

    // 指针点击抬起事件
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

                case 'Pencil': {
                    insertPath();
                    break;
                }
            }
        },
        [insertLayer, canvasState, camera]
    );

    // 指针点击按下事件
    const onPointerDown = useMutation(
        ({}, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);

            switch (canvasState.mode) {
                case 'Dragging': {
                    dispatch_canvas({ type: 'SET_DRAGGING_MODE', payload: { origin: point } });
                    break;
                }

                case 'Pencil': {
                    startDrawing(point, e.pressure);
                    break;
                }
            }
        },
        [canvasState, camera]
    );

    //指针拖动事件
    const onPointerMove = useMutation(
        ({}, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);

            switch (canvasState.mode) {
                case 'Dragging': {
                    if (canvasState.origin) {
                        const deltaX = e.movementX;
                        const deltaY = e.movementY;

                        dispatch_camera({ type: 'MOVE', payload: { deltaX, deltaY } });
                    }

                    break;
                }

                case 'Pencil': {
                    continueDrawing(point, e);
                    break;
                }

                case 'Resizing': {
                    resizeSelectedLayer(point);
                    break;
                }
            }
        },
        [canvasState, camera, continueDrawing]
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
            // e.preventDefault(); // 阻止默认滚动行为

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

            // // 计算缩放前鼠标位置（相对于画布内容）
            // const beforeScaleMouseX = (e.clientX - camera.x) / camera.zoom;
            // const beforeScaleMouseY = (e.clientY - camera.y) / camera.zoom;

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

    //图层选中事件
    const onLayerPointerDown = useMutation(
        ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
            e.stopPropagation();

            if (canvasState.mode === 'Dragging' || canvasState.mode === 'None') {
                if (!self.presence.selection.includes(layerId)) {
                    setMyPresence({ selection: [layerId] }, { addToHistory: true });
                }
            }
        },
        [canvasState.mode]
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
                        {canvasState.mode === 'Pencil' && pencilDraft && pencilDraft.length > 0 && (
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
                        <SelectionBox dispatch_canvas={dispatch_canvas} />
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
