import { shallow, useSelf, useStorage } from '@liveblocks/react';

/**
 * Compute the axis-aligned bounding box for a layer.
 *
 * @param layer - The layer whose position and dimensions should be used
 * @returns An object with `x`, `y`, `width`, and `height` representing the layer's bounding box
 */
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

/**
 * Compute the axis-aligned bounding box that encloses all layers in a list.
 *
 * @param layerList - Array of layers to include when computing the bounding box
 * @returns The enclosing rectangle as `{ x, y, width, height }`, or `null` if `layerList` is empty
 */
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

/**
 * Compute the bounding box of the currently selected layers.
 *
 * Reads the current user's selection from presence and the shared storage layers to compute
 * the minimal rectangle that encloses all selected layers.
 *
 * @returns The `XYHW` rectangle that encloses all selected layers, or `null` if no layers are selected
 */
export default function useSelectionBounds() {
    const selection = useSelf(self => self.presence.selection);

    const result = useStorage(root => {
        const selectedLayerList = selection?.map(id => root.layers.get(id)!).filter(Boolean);

        return boundingBox(selectedLayerList || []);
    }, shallow);

    return result;
}