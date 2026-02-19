import { shallow, useSelf, useStorage } from '@liveblocks/react';

function getLayerBounds(layer: Layer): XYHW {
    const { x, y, width, height, type } = layer;

    switch (type) {
        default:
            return {
                x,
                y,
                width,
                height
            };
    }
}

function boundingBox(layerList: Layer[]): XYHW | null {
    if (layerList.length === 0) {
        return null;
    }

    const initial = {
        minX: layerList[0].x,
        minY: layerList[0].y,
        maxX: layerList[0].x + layerList[0].width,
        maxY: layerList[0].y + layerList[0].height
    };

    const { minX, minY, maxX, maxY } = layerList.reduce((bound, layer) => {
        const { x, y, width, height } = getLayerBounds(layer);

        return {
            minX: Math.min(bound.minX, x),
            minY: Math.min(bound.minY, y),
            maxX: Math.max(bound.maxX, x + width),
            maxY: Math.max(bound.maxY, y + height)
        };
    }, initial);

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

export default function useSelectionBounds() {
    const selection = useSelf(self => self.presence.selection);

    const result = useStorage(root => {
        const selectedLayerList = selection?.map(id => root.layers.get(id)!).filter(Boolean);

        return boundingBox(selectedLayerList || []);
    }, shallow);

    return result;
}
