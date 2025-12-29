import { CancellationError } from './errors';

/**
 * 取消令牌
 * 
 * 用于取消异步操作的令牌对象。通过 `createCancelToken()` 创建。
 * 
 * @example
 * ```typescript
 * const { token, cancel } = createCancelToken();
 * 
 * // 在异步操作中使用
 * const promise = async function(token: CancelToken) {
 *     return new Promise((resolve, reject) => {
 *         token.onCancel((reason) => {
 *             reject(new CancellationError(reason));
 *         });
 *         
 *         // 执行异步操作
 *         setTimeout(() => resolve('完成'), 5000);
 *     });
 * }(token);
 * 
 * // 取消操作
 * cancel('用户取消');
 * ```
 */
export class CancelToken {
    private _cancelled: boolean = false;
    private _reason?: any;
    private _callbacks: Array<(reason?: any) => void> = [];

    /**
     * 是否已取消
     */
    get cancelled(): boolean {
        return this._cancelled;
    }

    /**
     * 取消原因
     */
    get reason(): any {
        return this._reason;
    }

    /**
     * 注册取消回调
     * 
     * 当令牌被取消时，所有注册的回调都会被调用。
     * 如果令牌已经被取消，回调会立即执行。
     * 
     * @param callback 取消回调函数
     * 
     * @example
     * ```typescript
     * token.onCancel((reason) => {
     *     console.log('操作被取消:', reason);
     *     // 清理资源
     *     cleanup();
     * });
     * ```
     */
    onCancel(callback: (reason?: any) => void): void {
        if (this._cancelled) {
            // 如果已经取消，立即执行回调
            callback(this._reason);
        } else {
            // 否则添加到回调列表
            this._callbacks.push(callback);
        }
    }

    /**
     * 取消令牌（内部方法）
     * 
     * 由 `createCancelToken()` 返回的 `cancel` 函数调用。
     * 
     * @param reason 取消原因
     */
    _cancel(reason?: any): void {
        // 防止重复取消
        if (this._cancelled) {
            return;
        }

        this._cancelled = true;
        this._reason = reason;

        // 执行所有注册的回调
        this._callbacks.forEach(cb => {
            try {
                cb(reason);
            } catch (error) {
                // 回调中的错误不应该影响取消流程
                console.error('CancelToken callback error:', error);
            }
        });

        // 清空回调列表，释放内存
        this._callbacks = [];
    }
}

/**
 * 创建取消令牌
 * 
 * 返回一个包含 `token` 和 `cancel` 函数的对象。
 * 调用 `cancel()` 可以取消使用该令牌的异步操作。
 * 
 * @returns 包含 token 和 cancel 函数的对象
 * 
 * @example
 * ```typescript
 * const { token, cancel } = createCancelToken();
 * 
 * const promise = someAsyncOperation(token);
 * 
 * // 取消操作
 * setTimeout(() => {
 *     cancel('用户取消');
 * }, 2000);
 * 
 * try {
 *     await promise;
 * } catch (error) {
 *     if (error instanceof CancellationError) {
 *         console.log('操作已取消');
 *     }
 * }
 * ```
 */
export function createCancelToken(): {
    token: CancelToken;
    cancel: (reason?: any) => void;
} {
    const token = new CancelToken();
    
    return {
        token,
        cancel: (reason?: any) => {
            token._cancel(reason);
        }
    };
}
