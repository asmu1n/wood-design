const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

export type CameraAction =
    | { type: 'MOVE'; payload: { deltaX: number; deltaY: number } }
    | { type: 'ZOOM_IN' }
    | { type: 'ZOOM_OUT' }
    | { type: 'SET_ZOOM'; payload: { scale: number; clientX: number; clientY: number } };

/**
 * 相机状态管理 reducer
 * @param state 当前相机状态
 * @param action 操作类型
 * @returns 更新后的相机状态
 */
export function cameraReducer(state: Camera, action: CameraAction): Camera {
    switch (action.type) {
        case 'MOVE':
            return {
                ...state,
                x: state.x + action.payload.deltaX,
                y: state.y + action.payload.deltaY
            };

        case 'ZOOM_IN': {
            const newZoom = Math.min(state.zoom + 0.1, MAX_ZOOM);

            return { ...state, zoom: newZoom };
        }

        case 'ZOOM_OUT': {
            const newZoom = Math.max(state.zoom - 0.1, MIN_ZOOM);

            return { ...state, zoom: newZoom };
        }

        case 'SET_ZOOM': {
            const { scale, clientX, clientY } = action.payload;
            const newScale = Math.max(MIN_ZOOM, Math.min(scale, MAX_ZOOM));

            // 计算缩放前鼠标位置（相对于画布内容）
            const beforeScaleMouseX = (clientX - state.x) / state.zoom;
            const beforeScaleMouseY = (clientY - state.y) / state.zoom;

            // 调整平移偏移量，使鼠标位置保持不变
            const translateX = clientX - beforeScaleMouseX * newScale;
            const translateY = clientY - beforeScaleMouseY * newScale;

            return {
                zoom: newScale,
                x: translateX,
                y: translateY
            };
        }

        default:
            return state;
    }
}

/**
 * 创建相机初始状态
 */
export function getInitialCamera(): Camera {
    return { x: 0, y: 0, zoom: 1 };
}
