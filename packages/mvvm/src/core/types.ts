/**
 * MVVM 核心类型定义
 */

/**
 * 路径类型工具
 * 
 * 递归路径类型，支持嵌套对象和数组路径
 * 
 * @template T 数据类型
 * @template Prefix 路径前缀（内部使用）
 * 
 * @example
 * ```typescript
 * interface PlayerData {
 *     name: string;
 *     stats: { health: number; level: number };
 *     items: Array<{ id: string; name: string }>;
 * }
 * 
 * type Paths = Path<PlayerData>;
 * // 'name' | 'stats' | 'stats.health' | 'stats.level' | 'items' | 'items.0' | 'items.0.id' | 'items.0.name'
 * ```
 */
export type Path<T, Prefix extends string = ''> = T extends object
    ? {
          [K in keyof T]: K extends string | number
              ? T[K] extends Array<infer U>
                  ? // 数组类型：支持数组本身、索引访问、数组项属性
                    | (Prefix extends '' ? K : `${Prefix}.${K}`)
                    | `${Prefix extends '' ? K : `${Prefix}.${K}`}.${number}`
                    | `${Prefix extends '' ? K : `${Prefix}.${K}`}.${number}.${Path<U>}`
                  : T[K] extends object
                  ? // 对象类型：支持对象本身和嵌套属性
                    | (Prefix extends '' ? K : `${Prefix}.${K}`)
                    | Path<T[K], Prefix extends '' ? `${K}` : `${Prefix}.${K}`>
                  : // 基本类型：只支持属性本身
                    Prefix extends ''
                  ? K
                  : `${Prefix}.${K}`
              : never;
      }[keyof T]
    : never;

/**
 * 路径值类型工具
 * 
 * 根据路径推断值的类型
 * 
 * @template T 数据类型
 * @template P 路径字符串
 * 
 * @example
 * ```typescript
 * interface PlayerData {
 *     name: string;
 *     stats: { health: number };
 *     items: Array<{ id: string }>;
 * }
 * 
 * type NameType = PathValue<PlayerData, 'name'>;        // string
 * type HealthType = PathValue<PlayerData, 'stats.health'>; // number
 * type ItemIdType = PathValue<PlayerData, 'items.0.id'>;   // string
 * ```
 */
export type PathValue<T, P extends string> = P extends keyof T
    ? T[P]
    : P extends `${infer K}.${infer R}`
    ? K extends keyof T
        ? R extends `${number}`
        ? T[K] extends Array<infer U>
            ? U
            : never
        : R extends `${number}.${infer Rest}`
        ? T[K] extends Array<infer U>
            ? PathValue<U, Rest>
            : never
        : PathValue<T[K], R>
        : never
    : never;

/**
 * 观察者接口（精简版）
 *
 * 职责：
 * - 声明并维护依赖
 * - 在依赖变化时重新执行
 */
export interface Watcher {
    /** 执行回调并重新收集依赖 */
    run(): void;

    /** 添加依赖（由 reactive.track 调用） */
    addDependency(key: string): void;

    /** 获取当前依赖集合 */
    getDependencies(): ReadonlySet<string>;

    /** 清除依赖（run 前调用） */
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
    /** 
     * 监听视图事件
     * 
     * change 事件回调签名：`(path: string, value: any) => void`
     * - path: 数据路径
     * - value: 值
     */
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
    /** 
     * 类型安全的绑定方法
     * 
     * @template P 路径类型（从 Path<T> 推断）
     * 
     * @example
     * ```typescript
     * interface PlayerData {
     *     name: string;
     *     stats: { health: number };
     * }
     * 
     * const viewModel = new ViewModel<PlayerData>(model);
     * 
     * // 类型安全：IDE 自动补全，编译时检查
     * viewModel.bind('name', view);              // ✅
     * viewModel.bind('stats.health', view);      // ✅
     * viewModel.bind('stats.hp', view);          // ❌ TypeScript 错误
     * ```
     */
    bind<P extends Path<T> & string>(
        path: P,
        view: IView,
        options?: BindingOptions<PathValue<T, P>>
    ): DataBinding<T, PathValue<T, P>>;
    /** 
     * 批量绑定方法
     * 
     * @template P 路径类型（从 Path<T> 推断）
     * 
     * @example
     * ```typescript
     * const bindings = viewModel.bindMany({
     *     name: { view, options: { mode: 'two-way' } },
     *     'stats.health': { view, options: { mode: 'one-way' } }
     * });
     * ```
     */
    bindMany<P extends Path<T> & string>(
        bindings: Record<P, BatchBindingItem<T, P>>
    ): Map<P, DataBinding<T, PathValue<T, P>>>;
    /** 
     * 声明式绑定配置方法
     * 
     * @example
     * ```typescript
     * viewModel.bindConfig({
     *     view,
     *     bindings: {
     *         name: { mode: 'two-way' },
     *         'stats.health': { mode: 'one-way', converter: (h) => `HP: ${h}` }
     *     }
     * });
     * ```
     */
    bindConfig(config: BindingConfig<T>): Map<string, DataBinding<T, any>>;
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
    /** 错误处理回调 */
    onError?: (error: Error, path: string, value: any) => void;
}

/**
 * 批量绑定配置项
 * 
 * @template T 数据类型
 * @template P 路径类型
 */
export interface BatchBindingItem<T, P extends Path<T> & string> {
    /** 视图 */
    view: IView;
    /** 绑定选项（可选） */
    options?: BindingOptions<PathValue<T, P>>;
}

/**
 * 声明式绑定配置
 * 
 * @template T 数据类型
 */
export interface BindingConfig<T> {
    /** 视图 */
    view: IView;
    /** 绑定配置映射：路径 -> 绑定选项 */
    bindings: {
        [P in Path<T> & string]?: BindingOptions<PathValue<T, P>>;
    };
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
    constructor(
        message: string,
        public path?: string,
        public value?: any
    ) {
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

/**
 * 验证错误
 */
export class ValidationError extends MVVMError {
    constructor(
        message: string,
        public path?: string,
        public value?: any
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}

/**
 * 路径错误
 */
export class PathError extends MVVMError {
    constructor(
        message: string,
        public path: string,
        public availablePaths?: string[]
    ) {
        super(message);
        this.name = 'PathError';
    }
}
