'use client';

import { colorToCss, pointerEventToCanvasPoint } from '@/lib/utils';
import { useMutation, useStorage } from '@liveblocks/react';
import LayerComponent from './canvas/LayerComponent';
import { nanoid } from 'nanoid';
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client';
import { useState } from 'react';
import ToolsBar from './ToolsBar';

const MAX_LAYERS = 100;

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

    const onPointerUp = useMutation(({}, e: React.PointerEvent) => {
        const point = pointerEventToCanvasPoint(e, camera);

        insertLayer('Rectangle', point);
    }, []);

    return (
        <div>
            <div style={{ backgroundColor: roomColor ? colorToCss(roomColor) : '#1e1e1e' }} className="h-screen touch-none">
                <svg onPointerUp={onPointerUp} className="h-full w-full">
                    <g>{layerIds?.map(layerId => <LayerComponent key={layerId} id={layerId}></LayerComponent>)}</g>
                </svg>
            </div>
            <ToolsBar canvasState={canvasState} setCanvasState={setCanvasState} />
        </div>
    );
}
