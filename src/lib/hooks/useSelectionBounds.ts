import { shallow, useSelf, useStorage } from '@liveblocks/react';

function boundingBox(layerList: Layer[]): XYHW | null {
    const first = layerList[0];

    if (!first) {
        return null;
    }

    return layerList.reduce(
        (bounds, layer) => {
            const { x, y, width, height } = layer;

            return {
                x: Math.min(bounds.x, x),
                y: Math.min(bounds.y, y),
                width: Math.max(bounds.x + bounds.width, x + width) - bounds.x,
                height: Math.max(bounds.y + bounds.height, y + height) - bounds.y
            };
        },
        { x: first.x, y: first.y, width: first.width, height: first.height }
    );
}

export default function useSelectionBounds() {
    const selection = useSelf(self => self.presence.selection);

    const result = useStorage(root => {
        const selectedLayerList = selection?.map(id => root.layers.get(id)!).filter(Boolean);

        return boundingBox(selectedLayerList || []);
    }, shallow);

    return result;
}
