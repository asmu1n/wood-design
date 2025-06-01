import { useStorage } from '@liveblocks/react';
import { memo } from 'react';
import RectangleLayer from './RectangLayer';
import EllipseLayer from './EllipseLayer';
import PathLayer from './PathLayer';
import TextLayer from './TextLayer';

interface LayerComponentProps {
    id: string;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
}

function LayerComponent({ id, onLayerPointerDown }: LayerComponentProps) {
    const layer = useStorage(root => root.layers.get(id));

    if (!layer) {
        return null;
    }

    function onSelect(e: React.PointerEvent) {
        onLayerPointerDown(e, id);
    }

    switch (layer.type) {
        case 'Rectangle': {
            return <RectangleLayer id={id} layer={layer} onSelect={onSelect} />;
        }

        case 'Ellipse': {
            return <EllipseLayer id={id} layer={layer} onSelect={onSelect} />;
        }

        case 'Path': {
            return <PathLayer id={id} layer={layer} onSelect={onSelect} />;
        }

        case 'Text': {
            return <TextLayer id={id} layer={layer} onSelect={onSelect} />;
        }

        default: {
            return null;
        }
    }
}

export default memo(LayerComponent);
