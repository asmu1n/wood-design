import { useStorage } from '@liveblocks/react';
import { memo } from 'react';
import RectangleLayer from './RectangLayer';
import EllipseLayer from './EllipseLayer';
import PathLayer from './PathLayer';
import TextLayer from './TextLayer';

function LayerComponent({ id }: { id: string }) {
    const layer = useStorage(root => root.layers.get(id));

    if (!layer) {
        return null;
    }

    switch (layer.type) {
        case 'Rectangle': {
            return <RectangleLayer id={id} layer={layer} />;
        }

        case 'Ellipse': {
            return <EllipseLayer id={id} layer={layer} />;
        }

        case 'Path': {
            return <PathLayer id={id} layer={layer} />;
        }

        case 'Text': {
            return <TextLayer id={id} layer={layer} />;
        }

        default: {
            return null;
        }
    }
}

export default memo(LayerComponent);
