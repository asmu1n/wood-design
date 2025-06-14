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

export function colorToCss(rgb?: Color) {
    if (!rgb) {
        return 'transparent';
    }

    return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
}

/**
 * 否定模式
 */
class Not<T> {
    constructor(public value: T) {}
}

function not<T>(value: T): Not<T> {
    return new Not(value);
}

/**
 * 或模式
 */
class Or<T> {
    constructor(public patterns: Pattern<T>[]) {}
}

function or<T>(...patterns: Pattern<T>[]): Or<T> {
    return new Or(patterns);
}

class Exists {
    constructor() {}
}

// 添加 exists 辅助函数
function exists() {
    return new Exists();
}

// 通配符占位
const _ = Symbol('wildcard');

type Pattern<T> = ((value: T) => boolean) | T | typeof _ | Not<Pattern<T>> | Or<Pattern<T>>;

class Matcher<T> {
    private isMatched: boolean = false;
    constructor(private value: T) {}

    on(pattern: Pattern<T extends Record<string, any> ? Record<keyof T, any> | T : T>, handler: (value: T) => void): Matcher<T> {
        const matched = this.matchesPattern(this.value, pattern);

        if (matched) {
            handler(this.value);
            this.isMatched = true;
        }

        // 继续链式调用
        return this;
    }

    private matchesPattern(value: any, pattern: Pattern<any>): boolean {
        const valueType = typeof value;
        const patternType = typeof pattern;

        if (this.isMatched) {
            return false;
        }

        // 通配符匹配
        if (pattern === _) {
            return true;
        }

        // 处理 Not 包装类型
        if (pattern instanceof Not) {
            const negatedValue = pattern.value;

            return !this.matchesPattern(value, negatedValue);
        }

        // 处理 Or 包装类型
        if (pattern instanceof Or) {
            return pattern.patterns.some(p => this.matchesPattern(value, p));
        }

        // 如果是函数，执行谓词
        if (patternType === 'function') {
            return (pattern as (value: any) => boolean)(value);
        }

        // 判断是否为基本类型（string / number / boolean）
        const isPrimitive =
            ['string', 'number', 'boolean'].includes(valueType) || value instanceof String || value instanceof Number || value instanceof Boolean;

        if (isPrimitive) {
            // 原始值直接比较
            return Object.is(value, pattern);
        }

        // 判断是否为数组
        if (Array.isArray(pattern)) {
            if (!Array.isArray(value)) {
                return false;
            }

            if (pattern.length > value.length) {
                return false;
            }

            // 尝试匹配数组中的每个元素
            return pattern.every((p, i) => this.matchesPattern(value[i], p));
        }

        // 对象匹配（部分匹配）
        if (patternType === 'object' && pattern !== null && valueType === 'object' && value !== null) {
            return Object.entries(pattern).every(([key, val]) => {
                return key in value && this.matchesPattern(value[key], val);
            });
        }

        return false;
    }
}

function match<T>(value: T): Matcher<T> {
    return new Matcher(value);
}

function validatorNoEmpty<T>(data: T): boolean {
    if (data === null || data === undefined || data === '') {
        return false;
    }

    if (typeof data === 'number' && data === 0) {
        return true;
    }

    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).length > 0;
    }

    if (data instanceof Array) {
        return data.length > 0;
    }

    return true;
}

export { validatorNoEmpty, match, _, not, or, exists };
