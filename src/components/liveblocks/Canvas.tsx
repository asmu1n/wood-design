'use client';

import { colorToCss, pointerEventToCanvasPoint } from '@/lib/utils';
import { useMutation, useStorage } from '@liveblocks/react';
import LayerComponent from './canvas/LayerComponent';
import { nanoid } from 'nanoid';
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client';
import { useCallback, useMemo, useState } from 'react';
import ToolsBar from './ToolsBar';

const MAX_LAYERS = 100;

const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

function mutation(
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
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
    const [canvasState, setCanvasState] = useState<CanvasType>({
        mode: 'None'
    });
    const insertLayer = useMutation(mutation, []);

    const onPointerUp = useMutation(
        ({}, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);

            if (canvasState.mode === 'Inserting') {
                insertLayer(canvasState.layerType, point);
            } else if (canvasState.mode === 'Dragging') {
                setCanvasState({ mode: 'Dragging', origin: null });
            }
        },
        [insertLayer, canvasState, camera]
    );
    const onPointerDown = useMutation(
        ({}, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);

            if (canvasState.mode === 'Dragging') {
                setCanvasState({ mode: 'Dragging', origin: point });
            }
        },
        [canvasState, camera]
    );

    const onPointerMove = useMutation(
        ({}, e: React.PointerEvent) => {
            if (canvasState.mode === 'Dragging' && canvasState.origin) {
                const deltaX = e.movementX;
                const deltaY = e.movementY;

                setCamera(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
            }
        },
        [canvasState, camera]
    );
    const onZoom = useMemo(() => {
        function zoomIn() {
            setCamera(prev => ({ ...prev, zoom: prev.zoom + 0.1 > 2 ? 2 : prev.zoom + 0.1 }));
        }

        function zoomOut() {
            setCamera(prev => ({ ...prev, zoom: prev.zoom - 0.1 < 0.1 ? 0.1 : prev.zoom - 0.1 }));
        }

        return {
            zoomIn,
            zoomOut
        };
    }, []);

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

            // 计算缩放前鼠标位置（相对于画布内容）
            const beforeScaleMouseX = (e.clientX - camera.x) / camera.zoom;
            const beforeScaleMouseY = (e.clientY - camera.y) / camera.zoom;

            // 调整平移偏移量，使鼠标位置保持不变
            const translateX = e.clientX - beforeScaleMouseX * newScale;
            const translateY = e.clientY - beforeScaleMouseY * newScale;

            setCamera({
                zoom: newScale,
                x: translateX,
                y: translateY
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
                        {layerIds?.map(layerId => <LayerComponent key={layerId} id={layerId}></LayerComponent>)}
                    </g>
                </svg>
            </div>
            <ToolsBar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                canZoomIn={camera.zoom < MAX_ZOOM}
                canZoomOut={camera.zoom > MIN_ZOOM}
                {...onZoom}
            />
        </div>
    );
}
