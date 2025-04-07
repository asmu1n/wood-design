import { useStorage } from '@liveblocks/react';
import { memo } from 'react';
import RectangleLayer from './RectangLayer';
import EllipseLayer from './EllipseLayer';

const LayerComponent = memo(function ({ id }: { id: string }) {
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

        case 'Text': {
            return <TextLayer />;
        }

        case 'Line': {
            return <LineLayer />;
        }

        default: {
            return null;
        }
    }
});

LayerComponent.displayName = 'LayerComponent';

export default LayerComponent;
