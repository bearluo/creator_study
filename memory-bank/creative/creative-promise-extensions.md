# CREATIVE PHASE: Core 模块 Promise 扩展 API 设计

📌 CREATIVE PHASE START: Promise Extensions API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM

**Description**: 为 `@bl-framework/core` 核心模块设计 Promise 扩展 API，提供超时控制、取消机制和常用工具函数，解决原生 Promise 的局限性。

**Requirements**:
- 提供简单易用的 API（`withTimeout`、`CancelToken`、`delay`）
- 类型安全，完整的 TypeScript 支持
- 性能开销小（< 1%）
- 向后兼容，不影响现有代码
- 正确处理资源清理（防止内存泄漏）
- 支持浏览器和 Node.js 环境

**Constraints**:
- 必须保持现有代码风格一致
- 不能修改原生 Promise 行为
- API 要直观，符合开发者直觉
- 必须正确处理边界情况（超时、取消、资源清理）

## 2️⃣ OPTIONS

### Option A: withTimeout - 简单函数式 API
**实现**：
```typescript
function withTimeout<T>(
    promise: Promise<T>, 
    ms: number, 
    message?: string
): Promise<T>
```

**特点**：
- 函数式风格，使用简单
- 自动清理定时器
- 支持自定义错误消息

### Option B: withTimeout - 对象配置 API
**实现**：
```typescript
function withTimeout<T>(
    promise: Promise<T>, 
    options: { timeout: number; message?: string; signal?: AbortSignal }
): Promise<T>
```

**特点**：
- 配置对象，更灵活
- 支持 AbortSignal 集成
- 可扩展性强

### Option C: CancelToken - 类式 API（类似 axios）
**实现**：
```typescript
class CancelToken {
    static source(): { token: CancelToken; cancel: (reason?: any) => void }
    cancelled: boolean
    reason?: any
    onCancel(callback: (reason?: any) => void): void
}
```

**特点**：
- 类式 API，功能完整
- 支持取消原因和回调
- 易于扩展

### Option D: CancelToken - 函数式 API
**实现**：
```typescript
function createCancelToken(): {
    token: CancelToken;
    cancel: (reason?: any) => void;
}
```

**特点**：
- 函数式风格
- 与现有代码风格一致
- 更简洁

### Option E: delay - 简单函数
**实现**：
```typescript
function delay(ms: number): Promise<void>
function delay<T>(ms: number, value: T): Promise<T>
```

**特点**：
- 简单直观
- 支持返回值重载
- 可组合使用

### Option F: delay - 可取消版本
**实现**：
```typescript
function delay(ms: number): { promise: Promise<void>; cancel: () => void }
```

**特点**：
- 支持取消
- 返回取消函数
- 更灵活

## 3️⃣ ANALYSIS

| Criterion | Option A (Simple) | Option B (Config) | Option C (Class) | Option D (Function) | Option E (Simple) | Option F (Cancelable) |
|-----------|------------------|-------------------|------------------|---------------------|-------------------|----------------------|
| **易用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **灵活性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **向后兼容** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **资源清理** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **代码风格一致性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

**Key Insights**:
- withTimeout: Option A 最简单易用，符合函数式风格
- CancelToken: Option C 功能最完整，但 Option D 更符合代码风格
- delay: Option E 最简单，但 Option F 更灵活（可后续扩展）

## 4️⃣ DECISION

**Selected**: 
- **withTimeout**: Option A - 简单函数式 API
- **CancelToken**: Option D - 函数式 API（但保留类实现）
- **delay**: Option E - 简单函数（后续可扩展可取消版本）

**Rationale**: 
- **withTimeout**: 简单函数式 API 最易用，符合现有代码风格（如 `FWPath.join()`）
- **CancelToken**: 函数式 API 更符合代码风格，但内部使用类实现以支持完整功能
- **delay**: 简单版本满足大部分需求，后续可扩展可取消版本

## 5️⃣ IMPLEMENTATION NOTES

### 5.1 withTimeout 实现

**API 签名**：
```typescript
/**
 * 为 Promise 添加超时控制
 * 
 * @param promise 要添加超时的 Promise
 * @param ms 超时时间（毫秒）
 * @param message 超时错误消息（可选）
 * @returns 带超时控制的 Promise
 * 
 * @example
 * ```typescript
 * const data = await withTimeout(fetchData(), 5000, '请求超时');
 * ```
 */
function withTimeout<T>(
    promise: Promise<T>, 
    ms: number, 
    message?: string
): Promise<T>
```

**实现要点**：
1. 使用 `Promise.race` 实现超时
2. 超时后清理定时器
3. 如果原 Promise 先完成，也要清理定时器
4. 抛出 `TimeoutError` 错误类型

**错误类型**：
```typescript
class TimeoutError extends Error {
    constructor(message: string = 'Operation timed out') {
        super(message);
        this.name = 'TimeoutError';
    }
}
```

**实现伪代码**：
```typescript
function withTimeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    
    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new TimeoutError(message));
        }, ms);
    });
    
    return Promise.race([
        promise.finally(() => {
            if (timeoutId) clearTimeout(timeoutId);
        }),
        timeoutPromise
    ]).finally(() => {
        if (timeoutId) clearTimeout(timeoutId);
    });
}
```

### 5.2 CancelToken 实现

**API 签名**：
```typescript
/**
 * 创建取消令牌
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
 * cancel('用户取消');
 * ```
 */
function createCancelToken(): {
    token: CancelToken;
    cancel: (reason?: any) => void;
}

/**
 * 取消令牌类
 */
class CancelToken {
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
     */
    onCancel(callback: (reason?: any) => void): void {
        if (this._cancelled) {
            callback(this._reason);
        } else {
            this._callbacks.push(callback);
        }
    }
    
    /**
     * 取消令牌（内部方法）
     */
    _cancel(reason?: any): void {
        if (this._cancelled) return;
        this._cancelled = true;
        this._reason = reason;
        this._callbacks.forEach(cb => cb(reason));
        this._callbacks = [];
    }
}
```

**实现要点**：
1. 使用工厂函数 `createCancelToken()` 创建
2. 内部使用类实现以支持状态管理
3. 支持取消回调和取消原因
4. 防止重复取消

### 5.3 delay 实现

**API 签名**：
```typescript
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
function delay(ms: number): Promise<void>;

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
function delay<T>(ms: number, value: T): Promise<T>;
```

**实现要点**：
1. 使用函数重载支持两种用法
2. 使用 `setTimeout` 实现
3. 简单直接，无需额外功能

### 5.4 错误类型定义

```typescript
/**
 * 超时错误
 */
export class TimeoutError extends Error {
    constructor(message: string = 'Operation timed out') {
        super(message);
        this.name = 'TimeoutError';
        // 保持错误堆栈
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TimeoutError);
        }
    }
}

/**
 * 取消错误
 */
export class CancellationError extends Error {
    constructor(reason?: any) {
        const message = reason 
            ? `Operation cancelled: ${String(reason)}`
            : 'Operation cancelled';
        super(message);
        this.name = 'CancellationError';
        this.reason = reason;
        // 保持错误堆栈
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CancellationError);
        }
    }
    
    /**
     * 取消原因
     */
    readonly reason?: any;
}
```

### 5.5 模块结构

```
packages/core/src/promise/
├── withTimeout.ts      # 超时控制函数
├── CancelToken.ts      # 取消令牌类
├── delay.ts            # 延迟函数
├── errors.ts           # 错误类型定义
└── index.ts            # 模块导出
```

### 5.6 导出策略

**promise/index.ts**:
```typescript
export { withTimeout } from './withTimeout';
export { createCancelToken, CancelToken } from './CancelToken';
export { delay } from './delay';
export { TimeoutError, CancellationError } from './errors';
```

**core/src/index.ts**:
```typescript
// Promise extensions
export * from './promise';
```

### 5.7 使用示例

**withTimeout**:
```typescript
import { withTimeout } from '@bl-framework/core';

// 基础用法
const data = await withTimeout(fetchData(), 5000);

// 自定义错误消息
try {
    const data = await withTimeout(fetchData(), 5000, '请求超时，请重试');
} catch (error) {
    if (error instanceof TimeoutError) {
        console.log('操作超时');
    }
}
```

**CancelToken**:
```typescript
import { createCancelToken } from '@bl-framework/core';

const { token, cancel } = createCancelToken();

// 在异步操作中使用
const promise = async function(token: CancelToken) {
    return new Promise((resolve, reject) => {
        token.onCancel((reason) => {
            reject(new CancellationError(reason));
        });
        
        // 执行异步操作
        setTimeout(() => resolve('完成'), 5000);
    });
}(token);

// 取消操作
setTimeout(() => cancel('用户取消'), 2000);
```

**delay**:
```typescript
import { delay } from '@bl-framework/core';

// 延迟 1 秒
await delay(1000);

// 延迟后返回指定值
const result = await delay(1000, 'Hello'); // 'Hello'
```

**组合使用**:
```typescript
import { withTimeout, createCancelToken, delay } from '@bl-framework/core';

// 带超时的延迟
const result = await withTimeout(delay(5000, '完成'), 3000); // 3 秒后超时

// 可取消的异步操作
const { token, cancel } = createCancelToken();
const promise = someAsyncOperation(token);
setTimeout(() => cancel(), 2000);
```

### 5.8 边界情况处理

1. **withTimeout**:
   - 超时时间为 0 或负数：立即超时
   - Promise 已 resolve/reject：正常处理
   - 定时器清理：确保在所有情况下都清理

2. **CancelToken**:
   - 重复取消：忽略后续取消调用
   - 取消后注册回调：立即执行回调
   - 取消原因：支持任意类型

3. **delay**:
   - 延迟时间为 0 或负数：立即 resolve
   - 返回值：支持任意类型

### 5.9 性能考虑

1. **withTimeout**:
   - 使用 `Promise.race` 性能开销小
   - 及时清理定时器避免内存泄漏
   - 避免不必要的 Promise 创建

2. **CancelToken**:
   - 使用数组存储回调，查找 O(n)
   - 取消后清空数组释放内存
   - 避免闭包泄漏

3. **delay**:
   - 直接使用 `setTimeout`，性能最优
   - 无额外开销

### 5.10 测试要点

1. **withTimeout**:
   - 正常完成不超时
   - 超时后正确 reject
   - 资源正确清理
   - 自定义错误消息

2. **CancelToken**:
   - 创建和取消功能
   - 取消原因传递
   - 取消回调执行
   - 重复取消处理

3. **delay**:
   - 延迟时间正确
   - 返回值正确
   - 边界情况处理

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CREATIVE PHASE END

## VERIFICATION

- [x] Problem clearly defined
- [x] Multiple options considered
- [x] Decision made with rationale
- [x] Implementation guidance provided
- [x] API signatures defined
- [x] Error types defined
- [x] Usage examples provided
- [x] Edge cases considered
