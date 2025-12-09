import { shallow, useOthersConnectionIds, useOthersMapped } from '@liveblocks/react';
import { memo } from 'react';
import Cursor from './Cursor';
import PathLayer from './PathLayer';
import { connectionIdToColor } from '@/utils/layer';
import { hexToRgb } from '@/utils/common';

function Cursors() {
    const idList = useOthersConnectionIds();

    return (
        <>
            {idList.map(id => (
                <Cursor key={id} connectionId={id} />
            ))}
        </>
    );
}

function Drafts() {
    const others = useOthersMapped(
        other => ({
            id: other.id,
            pencilDraft: other.presence.pencilDraft,
            penColor: other.presence.penColor || hexToRgb(connectionIdToColor(other.connectionId))
        }),
        shallow
    );

    const othersContent = others.map(([userKey, user]) => {
        if (!user.pencilDraft) {
            return null;
        }

        return (
            <PathLayer
                id={user.id}
                key={userKey}
                layer={{
                    x: 0,
                    y: 0,
                    points: user.pencilDraft,
                    fill: user.penColor,
                    type: 'Path',
                    opacity: 100
                }}
            />
        );
    });

    return <>{othersContent}</>;
}

function MultiplayerGuides() {
    return (
        <>
            <Cursors />
            <Drafts />
        </>
    );
}

export default memo(MultiplayerGuides);
