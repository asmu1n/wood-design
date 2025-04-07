import { twMerge, twJoin, type ClassNameValue } from 'tailwind-merge';
import { toast } from '@/lib/hooks/useToast';
import { SQL } from 'drizzle-orm';

// 动态样式组合以及合并函数
export function cn(...inputs: ClassNameValue[]) {
    return twMerge(twJoin(inputs));
}

//签发授权上传Url到R2
export async function uploadFileByUrl(file: File) {
    try {
        const getUrl = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type
            })
        });
        const getUrlRes: IResponse<{
            uploadUrl: string;
            publicUrl: string;
        }> = await getUrl.json();

        if (!getUrlRes.success || !getUrlRes.data) {
            throw new Error(getUrlRes.message);
        }

        const {
            data: { uploadUrl, publicUrl }
        } = getUrlRes;

        const upload = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type
            },
            body: file
        });

        if (upload.ok) {
            return publicUrl;
        } else {
            throw new Error('上传失败');
        }
    } catch (error) {
        console.error(error);
        toast({
            title: '失败',
            description: '上传失败',
            variant: 'destructive'
        });
    }
}

// 判断是服务端还是客户端组件
export function isServer() {
    if (typeof window == 'undefined') {
        console.log('server component');
    } else {
        console.log('client component');
    }
}

interface transformUrlParams {
    baseUrl: string;
    params: Record<string, string | number>;
}

//GET请求参数拼接
export function transformGetParams({ baseUrl, params }: transformUrlParams) {
    const url = new URL(baseUrl, window.location.href);

    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.append(key, params[key] as string);
        }
    });

    return url;
}

export function queryFilter<T extends Record<string, any>>(filterConfig: Record<keyof T, (value: any) => SQL>, filterParams: T): SQL[] {
    const filters: SQL[] = [];

    Object.entries(filterParams).forEach(([key, value]) => {
        if (value || value === false || value === 0) {
            const filter = filterConfig[key as keyof typeof filterConfig];

            if (filter) {
                filters.push(filter(value));
            }
        }
    });

    return filters;
}

export function colorToCss(rgb: Color) {
    return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
}

export function pointerEventToCanvasPoint(e: React.PointerEvent, camera: Camera): Point {
    return {
        x: Math.round(e.clientX) - camera.x,
        y: Math.round(e.clientY) - camera.y
    };
}
