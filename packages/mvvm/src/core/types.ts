/**
 * MVVM 核心类型定义
 */

/**
 * 观察者接口
 */
export interface Watcher {
    /** 更新回调 */
    update(key: string | symbol, newValue: any, oldValue: any): void;
    /** 运行回调 收集依赖 */
    run(): void;
    /** 添加依赖 */
    addDependency(key: string | symbol): void;
    /** 获取所有依赖 */
    getDependencies(): ReadonlySet<string | symbol>;
    /** 清除依赖 */
    clearDependencies(): void;
}

/**
 * 响应式数据接口
 */
export interface IReactive<T> {
    /** 响应式值（只读） */
    readonly value: T;
    /** 添加观察者 */
    watch(watcher: Watcher): () => void;
    /** 移除观察者 */
    unwatch(watcher: Watcher): void;
}

/**
 * 视图接口（框架无关）
 */
export interface IView {
    /** 更新视图路径的值 */
    update(path: string, value: any): void;
    /** 获取视图路径的值 */
    get(path: string): any;
    /** 设置视图路径的值 */
    set(path: string, value: any): void;
    /** 监听视图事件 */
    on(event: string, callback: (...args: any[]) => void): () => void;
    /** 销毁视图 */
    destroy(): void;
}

/**
 * 数据模型接口
 */
export interface IModel<T = any> {
    /** 数据（只读） */
    readonly data: T;
    /** 验证数据 */
    validate(): boolean;
    /** 序列化为 JSON */
    toJSON(): string;
    /** 从 JSON 反序列化 */
    fromJSON(json: string): void;
}

/**
 * 视图模型接口
 */
export interface IViewModel<T = any> {
    /** 数据模型（只读） */
    readonly model: IModel<T>;
    /** 响应式数据（只读） */
    readonly reactive: IReactive<T>;
    /** 绑定数据到视图 */
    bind<TValue = any, TViewValue = any>(
        path: string, 
        view: IView, 
        options?: BindingOptions<TValue, TViewValue>
    ): DataBinding<T, TValue, TViewValue>;
    /** 解绑 */
    unbind(binding: DataBinding<T, any, any>): void;
    /** 销毁视图模型 */
    destroy(): void;
}

/**
 * 绑定选项
 * 
 * @template TValue 数据值的类型（可选，用于类型安全）
 * @template TViewValue 视图值的类型（可选，默认为 TValue）
 * 
 * @example
 * ```typescript
 * interface PlayerData {
 *     name: string;
 *     level: number;
 * }
 * 
 * // 类型安全的转换器
 * const options: BindingOptions<string> = {
 *     converter: (value: string) => `Name: ${value}` // ✅ value 是 string 类型
 * };
 * 
 * // 或者使用泛型推断
 * const options = {
 *     converter: (value: string) => `Name: ${value}` // TypeScript 会自动推断
 * } satisfies BindingOptions<string>;
 * ```
 */
export interface BindingOptions<TValue = any, TViewValue = any> {
    /** 绑定方向：'one-way' | 'two-way' | 'one-way-to-source' */
    mode?: 'one-way' | 'two-way' | 'one-way-to-source';
    /** 转换函数（数据 -> 视图） */
    converter?: (value: TValue) => TViewValue;
    /** 反向转换函数（视图 -> 数据） */
    reverseConverter?: (value: TViewValue) => TValue;
    /** 验证函数 */
    validator?: (value: TValue | TViewValue) => boolean;
}

/**
 * 数据绑定接口
 * 
 * @template TData 数据对象的类型（用于内部实现，保证 reactive 类型安全）
 * @template TValue 数据值的类型
 * @template TViewValue 视图值的类型
 */
export interface DataBinding<TData = any, TValue = any, TViewValue = any> {
    /** 销毁绑定 */
    destroy(): void;
}

/**
 * MVVM 错误基类
 */
export class MVVMError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MVVMError';
    }
}

/**
 * 绑定错误
 */
export class BindingError extends MVVMError {
    constructor(message: string) {
        super(message);
        this.name = 'BindingError';
    }
}

/**
 * 响应式错误
 */
export class ReactiveError extends MVVMError {
    constructor(message: string) {
        super(message);
        this.name = 'ReactiveError';
    }
}
