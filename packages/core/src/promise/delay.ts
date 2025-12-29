/**
 * 延迟指定时间后 resolve
 * 
 * @param ms 延迟时间（毫秒）
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * await delay(1000); // 延迟 1 秒
 * ```
 */
export function delay(ms: number): Promise<void>;

/**
 * 延迟指定时间后 resolve 指定值
 * 
 * @param ms 延迟时间（毫秒）
 * @param value 要返回的值
 * @returns Promise<T>
 * 
 * @example
 * ```typescript
 * const result = await delay(1000, 'Hello'); // 1 秒后返回 'Hello'
 * ```
 */
export function delay<T>(ms: number, value: T): Promise<T>;

/**
 * 延迟函数实现
 * 
 * 使用函数重载支持两种用法：
 * 1. `delay(ms)` - 延迟后返回 void
 * 2. `delay(ms, value)` - 延迟后返回指定值
 */
export function delay<T>(ms: number, value?: T): Promise<T | void> {
    // 如果延迟时间 <= 0，立即 resolve
    if (ms <= 0) {
        return Promise.resolve(value);
    }

    return new Promise<T | void>((resolve) => {
        setTimeout(() => {
            resolve(value);
        }, ms);
    });
}
