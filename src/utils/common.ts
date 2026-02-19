import { twMerge, twJoin, type ClassNameValue } from 'tailwind-merge';
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
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error(error);
        throw error;
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
            const getFilter = filterConfig[key as keyof typeof filterConfig];

            if (getFilter) {
                filters.push(getFilter(value));
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

export function hexToRgb(hex: string): Color {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return { r, g, b };
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
type PatternValue<T> = T | ((value: T) => any);

type PatternObject<T> = {
    [K in keyof T]?: PatternValue<T[K]>;
};
class Matcher<T> {
    private isMatched: boolean = false;
    constructor(private value: T) {}

    on<U>(pattern: PatternObject<U> | U, handler: (value: U) => void): Matcher<T> {
        const matched = this.matchesPattern(this.value, pattern);

        if (matched) {
            handler(this.value as unknown as U);
            this.isMatched = true;
        }

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

// 定义一个唯一的 Symbol，外部无法伪造
const ResultSymbol = Symbol('__AttemptResult__');

// 2. 定义基础类型
// 我们给元组加上一个可选的 Symbol 属性标记，仅用于类型识别，不影响解构
export type AttemptSuccess<T> = readonly [null, T];

export type AttemptFailure<E> = readonly [E, null];

export type AttemptResult<E, T> = AttemptSuccess<T> | AttemptFailure<E>;

// 3. 关键：智能拆箱类型 (Magic Type)
// 如果 T 已经是 AttemptResult，则提取出内部的 E 和 D，并与新的 Error 合并
// 否则，将其视为普通值，包裹为 [Error, T]
type UnpackedResult<T> = T extends AttemptResult<infer E, infer D> ? AttemptResult<E | Error, D> : AttemptResult<Error, T>;

type AsyncUnpackedResult<T> = Promise<UnpackedResult<T>>;
function attempt<T>(operation: Promise<T>): AsyncUnpackedResult<T>;

function attempt<T>(operation: () => Promise<T>): AsyncUnpackedResult<T>;

function attempt<T>(operation: () => T): UnpackedResult<T>;

// 统一实现
function attempt(operation: any): any {
    const handleSuccess = (val: any) => {
        // ✨ 严谨拆箱：只有带 Symbol 的数组才会被原样返回
        if (isAttemptResult(val)) {
            return val;
        }

        return ok(val);
    };

    const handleError = (e: any) => {
        if (isAttemptResult(e)) {
            return e;
        }

        return err(e instanceof Error ? e : new Error(String(e)));
    };

    if (operation instanceof Promise) {
        return operation.then(handleSuccess).catch(handleError);
    }

    try {
        const result = operation();

        if (result instanceof Promise || (result && typeof result.then === 'function')) {
            return (result as Promise<any>).then(handleSuccess).catch(handleError);
        }

        return handleSuccess(result);
    } catch (e) {
        return handleError(e);
    }
}

function ok<T>(value: T) {
    const tuple: AttemptSuccess<T> = [null, value];

    // 使用 Object.defineProperty 定义不可枚举属性，防止遍历数组时把这个标记遍历出来
    Object.defineProperty(tuple, ResultSymbol, {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
    });

    return tuple;
}

function err<E>(error: E) {
    const tuple: AttemptFailure<E> = [error, null];

    Object.defineProperty(tuple, ResultSymbol, {
        value: true,
        writable: false,
        enumerable: false,
        configurable: false
    });

    return tuple;
}

function isAttemptResult<E, T>(value: any): value is AttemptResult<E, T> {
    return value && typeof value === 'object' && value[ResultSymbol] === true;
}

export { validatorNoEmpty, match, _, not, or, exists, attempt, ok, err };
