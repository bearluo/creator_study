/**
 * Promise 扩展错误类型
 */

/**
 * 超时错误
 * 
 * 当 Promise 操作超时时抛出此错误
 * 
 * @example
 * ```typescript
 * try {
 *     await withTimeout(slowOperation(), 5000);
 * } catch (error) {
 *     if (error instanceof TimeoutError) {
 *         console.log('操作超时');
 *     }
 * }
 * ```
 */
export class TimeoutError extends Error {
    constructor(message: string = 'Operation timed out') {
        super(message);
        this.name = 'TimeoutError';
        
        // 保持错误堆栈（Node.js 环境）
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TimeoutError);
        }
    }
}

/**
 * 取消错误
 * 
 * 当 Promise 操作被取消时抛出此错误
 * 
 * @example
 * ```typescript
 * const { token, cancel } = createCancelToken();
 * 
 * try {
 *     await cancellableOperation(token);
 * } catch (error) {
 *     if (error instanceof CancellationError) {
 *         console.log('操作已取消:', error.reason);
 *     }
 * }
 * ```
 */
export class CancellationError extends Error {
    /**
     * 取消原因
     */
    readonly reason?: any;

    constructor(reason?: any) {
        const message = reason 
            ? `Operation cancelled: ${String(reason)}`
            : 'Operation cancelled';
        super(message);
        this.name = 'CancellationError';
        this.reason = reason;
        
        // 保持错误堆栈（Node.js 环境）
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CancellationError);
        }
    }
}
