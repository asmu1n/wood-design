import { twMerge, twJoin, type ClassNameValue } from 'tailwind-merge';
import { SQL } from 'drizzle-orm';

/**
 * Compose and merge Tailwind CSS class names.
 *
 * @param inputs - One or more class name values to compose (strings, arrays, or objects)
 * @returns A single space-separated class name string with Tailwind-specific conflicts resolved
 */
export function cn(...inputs: ClassNameValue[]) {
    return twMerge(twJoin(inputs));
}

/**
 * Uploads a file by requesting a signed upload URL from the server, performing the upload, and returning the file's public URL.
 *
 * @param file - The File object to upload (its name and MIME type are sent to request the signed URL).
 * @returns The public URL where the uploaded file is accessible.
 * @throws Error when obtaining the upload URL or performing the upload fails.
 */
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

/**
 * Logs whether the current runtime is a server or a client environment.
 *
 * Prints "server component" when `window` is undefined; otherwise prints "client component".
 */
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

/**
 * Build a URL by resolving a base URL against the current location and appending query parameters from an object.
 *
 * @param baseUrl - The base URL string to resolve (may be relative or absolute)
 * @param params - An object mapping query parameter names to values; only entries with truthy values are appended
 * @returns The constructed `URL` with the given query parameters appended
 */
export function transformGetParams({ baseUrl, params }: transformUrlParams) {
    const url = new URL(baseUrl, window.location.href);

    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.append(key, params[key] as string);
        }
    });

    return url;
}

/**
 * Builds SQL filter expressions from provided parameters using a key-to-filter factory mapping.
 *
 * @param filterConfig - An object mapping parameter keys to functions that produce an `SQL` filter from a parameter value.
 * @param filterParams - Parameter values to convert into filters; values that are truthy, `false`, or `0` will be processed.
 * @returns An array of `SQL` filters produced by calling the corresponding factory for each applicable parameter.
 */
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

/**
 * Converts a Color object to a hexadecimal CSS color string.
 *
 * @param rgb - An object with numeric `r`, `g`, and `b` components (0–255). If omitted, the function produces a transparent color.
 * @returns `transparent` if `rgb` is undefined, otherwise a hex color string in the format `#rrggbb`
 */
export function colorToCss(rgb?: Color) {
    if (!rgb) {
        return 'transparent';
    }

    return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
}

/**
 * Converts a 7-character hex color string into its RGB components.
 *
 * @param hex - A hex color string in the form `#RRGGBB`
 * @returns An object with `r`, `g`, and `b` numeric components (0–255)
 */
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

/**
 * Wraps a pattern value to indicate it should be negated in pattern matching.
 *
 * @param value - The pattern or value to negate
 * @returns A `Not` instance that represents the negation of `value` for use in matchers
 */
function not<T>(value: T): Not<T> {
    return new Not(value);
}

/**
 * 或模式
 */
class Or<T> {
    constructor(public patterns: Pattern<T>[]) {}
}

/**
 * Creates an OR-pattern group from the provided patterns.
 *
 * @param patterns - One or more patterns; the resulting group matches if any pattern matches a value.
 * @returns An `Or` instance that succeeds when any of the provided `patterns` matches.
 */
function or<T>(...patterns: Pattern<T>[]): Or<T> {
    return new Or(patterns);
}

class Exists {
    constructor() {}
}

/**
 * Creates an existence matcher for pattern matching.
 *
 * @returns An `Exists` instance representing an existence check
 */
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

/**
 * Creates a Matcher for the provided value.
 *
 * @param value - The value to match against patterns using the matcher.
 * @returns A Matcher initialized with `value` for chaining pattern handlers.
 */
function match<T>(value: T): Matcher<T> {
    return new Matcher(value);
}

/**
 * Determines whether a value is considered non-empty using the utility's rules.
 *
 * The function treats the following as empty: `null`, `undefined`, and the empty string `''`.
 * Numbers are considered non-empty (including `0`). Plain objects are non-empty when they have at least one own key. Arrays are non-empty when their length is greater than zero. All other values are treated as non-empty.
 *
 * @param data - The value to evaluate for emptiness
 * @returns `true` if `data` is considered non-empty, `false` otherwise
 */
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

type AttemptSuccess<T> = readonly [null, T];
type AttemptFailure<E> = readonly [E, null];
type AttemptResult<E, T> = AttemptSuccess<T> | AttemptFailure<E>;
type AttemptResultAsync<E, T> = Promise<AttemptResult<E, T>>;

function attempt<T, E = Error>(operation: Promise<T>): AttemptResultAsync<E, T>;
function attempt<T, E = Error>(operation: () => Promise<T>): AttemptResultAsync<E, T>;
function attempt<T, E = Error>(operation: () => T): AttemptResult<E, T>;
/**
 * Executes an operation and returns a tuple representing either its successful result or the error that occurred.
 *
 * @param operation - A Promise or a function that returns a value or a Promise of a value.
 * @returns A tuple where the first element is `null` and the second is the result value on success, or the first is the error and the second is `null` on failure.
 */
function attempt<T, E = Error>(operation: Promise<T> | (() => T | Promise<T>)): AttemptResult<E, T> | AttemptResultAsync<E, T> {
    if (operation instanceof Promise) {
        return operation.then((value: T) => [null, value] as const).catch((error: E) => [error, null] as const);
    }

    try {
        const result = operation();

        if (result instanceof Promise || (result && typeof result === 'object' && 'then' in result && typeof (result as any).then === 'function')) {
            return (result as Promise<T>).then((value: T) => [null, value] as const).catch((error: E) => [error, null] as const);
        }

        return [null, result] as const;
    } catch (error) {
        return [error as E, null] as const;
    }
}

export { validatorNoEmpty, match, _, not, or, exists, attempt };