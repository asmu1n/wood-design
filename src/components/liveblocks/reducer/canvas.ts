export type CanvasAction =
    | { type: 'SET_NONE_MODE' }
    // | { type: 'SET_PENCIL_MODE' }
    | { type: 'SET_INSERT_MODE'; payload: { layerType: LayerType } }
    | { type: 'SET_DRAGGING_MODE'; payload: { origin: Point | null } }
    | { type: 'SET_RESIZING_MODE'; payload: { initialBounds: XYHW; corner: Side } }
    | { type: 'SET_PENCIL_DRAFT'; payload: [number, number, number][] | null }
    | { type: 'SET_SELECTION'; payload: string[] }
    | { type: 'SET_CURSOR'; payload: Point };

/**
 * 相关 Canvas 状态管理 reducer
 * @param state 当前 canvas 状态
 * @param action 操作类型
 * @returns 更新后的 canvas 状态
 */
export function canvasReducer(state: CanvasType, action: CanvasAction): CanvasType {
    switch (action.type) {
        case 'SET_NONE_MODE':
            return { mode: 'None' };

        // case 'SET_PENCIL_MODE':
        //     return { mode: 'Pencil' };

        case 'SET_INSERT_MODE':
            return {
                mode: 'Inserting',
                layerType: action.payload.layerType
            };

        case 'SET_DRAGGING_MODE':
            return {
                mode: 'Dragging',
                origin: action.payload.origin
            };

        case 'SET_RESIZING_MODE':
            return {
                mode: 'Resizing',
                initialBounds: action.payload.initialBounds,
                corner: action.payload.corner
            };

        case 'SET_PENCIL_DRAFT':
        case 'SET_SELECTION':
        case 'SET_CURSOR':
            // 这些 action 只用于更新 presence，不改变 CanvasState
            return state;

        default:
            return state;
    }
}

export function getInitialCanvasState(): CanvasType {
    return { mode: 'None' };
}
