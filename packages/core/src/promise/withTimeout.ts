import { TimeoutError } from './errors';

/**
 * 为 Promise 添加超时控制
 * 
 * 如果 Promise 在指定时间内未完成，将自动 reject 并抛出 TimeoutError。
 * 无论 Promise 是否超时，都会正确清理定时器资源。
 * 
 * @param promise 要添加超时的 Promise
 * @param ms 超时时间（毫秒）
 * @param message 超时错误消息（可选）
 * @returns 带超时控制的 Promise
 * 
 * @example
 * ```typescript
 * // 基础用法
 * const data = await withTimeout(fetchData(), 5000);
 * 
 * // 自定义错误消息
 * try {
 *     const data = await withTimeout(fetchData(), 5000, '请求超时，请重试');
 * } catch (error) {
 *     if (error instanceof TimeoutError) {
 *         console.log('操作超时');
 *     }
 * }
 * ```
 */
export function withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    message?: string
): Promise<T> {
    // 如果超时时间 <= 0，立即超时
    if (ms <= 0) {
        return Promise.reject(new TimeoutError(message));
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // 创建超时 Promise
    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new TimeoutError(message));
        }, ms);
    });

    // 使用 Promise.race 实现超时控制
    return Promise.race([
        // 原 Promise 完成后清理定时器
        promise.finally(() => {
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
        }),
        // 超时 Promise
        timeoutPromise
    ]).finally(() => {
        // 确保在所有情况下都清理定时器
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
    });
}
