# CREATIVE PHASE: MVVM 框架 API 设计

📌 CREATIVE PHASE START: MVVM Framework API Design
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM

**Description**: 设计独立的 `@bl-framework/mvvm` 和 `@bl-framework/mvvm-creator` 模块 API，提供完整的 MVVM 架构模式支持，解决视图和数据逻辑耦合、缺少数据绑定机制的问题。

**Requirements**:
- 提供简单易用的 API（Model、ViewModel、Reactive、Binding）
- 类型安全，完整的 TypeScript 支持
- 支持响应式数据（Reactive Data）
- 支持数据绑定（单向、双向）
- 支持计算属性（Computed Properties）
- 支持命令模式（Command Pattern）
- 框架无关（核心模块）
- Cocos Creator 集成（集成模块）
- 与现有代码风格一致（参考 ECS、FSM 模块）
- 性能开销小

**Constraints**:
- 必须与 ECS、FSM 模块结构类似
- 核心模块必须框架无关
- API 要直观，符合开发者直觉
- 必须正确处理边界情况（循环依赖、深层对象、数组等）
- 必须支持浏览器和 Node.js 环境

## 2️⃣ OPTIONS

### 决策 1: 响应式系统实现

#### Option A: Proxy-based（推荐）
**实现**：
```typescript
class Reactive<T> {
    private _value: T;
    private _proxy: T;
    private watchers: Set<Watcher> = new Set();
    
    constructor(value: T) {
        this._value = value;
        this._proxy = this._createProxy(value);
    }
    
    private _createProxy(target: T): T {
        return new Proxy(target, {
            get: (target, key) => {
                // 依赖收集
                this._trackDependency(key);
                return Reflect.get(target, key);
            },
            set: (target, key, value) => {
                const oldValue = Reflect.get(target, key);
                Reflect.set(target, key, value);
                // 触发更新
                this._triggerUpdate(key, value, oldValue);
                return true;
            }
        });
    }
}
```

**特点**：
- 使用 ES6 Proxy 实现响应式
- 性能好，API 简洁
- 自动依赖追踪
- 需要现代浏览器支持（IE 不支持）

#### Option B: Object.defineProperty
**实现**：
```typescript
class Reactive<T> {
    private _value: T;
    
    constructor(value: T) {
        this._value = value;
        this._defineReactive(value);
    }
    
    private _defineReactive(obj: any, key?: string): void {
        Object.keys(obj).forEach(key => {
            let val = obj[key];
            Object.defineProperty(obj, key, {
                get: () => {
                    this._trackDependency(key);
                    return val;
                },
                set: (newVal) => {
                    const oldVal = val;
                    val = newVal;
                    this._triggerUpdate(key, newVal, oldVal);
                }
            });
        });
    }
}
```

**特点**：
- 兼容性好（支持 IE9+）
- 性能较差（需要遍历所有属性）
- API 复杂（需要递归处理嵌套对象）
- 无法监听数组索引变化

#### Option C: 手动通知
**实现**：
```typescript
class Reactive<T> {
    private _value: T;
    private watchers: Set<Watcher> = new Set();
    
    set(value: T): void {
        const oldValue = this._value;
        this._value = value;
        this._notifyWatchers(value, oldValue);
    }
    
    get(): T {
        return this._value;
    }
}
```

**特点**：
- 完全控制
- 性能最好
- 需要手动调用通知方法
- 不符合响应式编程习惯

### 决策 2: 数据绑定实现

#### Option A: 基于 Proxy 的自动绑定（推荐）
**实现**：
```typescript
class DataBinding {
    bind(source: Reactive<any>, target: View, path: string): void {
        // 自动追踪依赖
        const watcher = new Watcher(() => {
            const value = this._getValue(source, path);
            this._updateView(target, path, value);
        });
        source.watch(watcher);
    }
}
```

**特点**：
- 自动追踪依赖
- 自动更新视图
- 性能开销较大（需要创建 Watcher）
- 使用简单

#### Option B: 基于观察者模式的手动绑定
**实现**：
```typescript
class DataBinding {
    bind(source: any, target: View, path: string, callback: (value: any) => void): void {
        // 手动注册监听器
        source.on('change', (value) => {
            callback(value);
        });
    }
}
```

**特点**：
- 性能好
- 需要手动注册绑定
- 灵活性高
- 需要手动管理生命周期

#### Option C: 混合方案
**实现**：
```typescript
class DataBinding {
    // 核心数据使用 Proxy
    bindReactive(source: Reactive<any>, target: View, path: string): void {
        // 自动绑定
    }
    
    // 视图更新使用观察者模式
    bindManual(source: any, target: View, path: string, callback: (value: any) => void): void {
        // 手动绑定
    }
}
```

**特点**：
- 核心数据使用 Proxy
- 视图更新使用观察者模式
- 平衡性能和易用性
- API 复杂度中等

### 决策 3: API 设计

#### Option A: 类式 API（推荐）
**实现**：
```typescript
class ViewModel {
    private reactive: Reactive<any>;
    private bindings: DataBinding[] = [];
    
    constructor(data: any) {
        this.reactive = new Reactive(data);
    }
    
    bind(path: string, view: View): void {
        const binding = new DataBinding();
        binding.bind(this.reactive, view, path);
        this.bindings.push(binding);
    }
}
```

**特点**：
- 类式 API，符合现有代码风格（ECS、FSM）
- 状态封装，易于管理
- 支持泛型，类型安全
- 符合面向对象编程习惯

#### Option B: 函数式 API
**实现**：
```typescript
function createViewModel<T>(data: T): ViewModel<T> {
    const reactive = createReactive(data);
    return {
        reactive,
        bind: (path: string, view: View) => {
            bindData(reactive, view, path);
        }
    };
}
```

**特点**：
- 函数式风格
- 易于测试
- 不符合现有代码风格
- 状态管理复杂

#### Option C: 混合方案
**实现**：结合 Option A + 工厂函数
- ViewModel 类（核心 API）
- createViewModel 工厂函数（可选）
- 两者都提供，让开发者选择

**特点**：
- 类式 API 为主
- 提供工厂函数作为补充
- 灵活性高

### 决策 4: 指令系统设计

#### Option A: 基于类的指令系统（推荐）
**实现**：
```typescript
abstract class Directive {
    abstract execute(element: any, value: any, context: any): void;
    abstract update(element: any, value: any, oldValue: any, context: any): void;
    abstract destroy(element: any): void;
}

class IfDirective extends Directive {
    execute(element: any, value: boolean, context: any): void {
        if (value) {
            element.show();
        } else {
            element.hide();
        }
    }
}
```

**特点**：
- 基于类的设计，易于扩展
- 明确的生命周期（execute、update、destroy）
- 类型安全
- 符合现有代码风格

#### Option B: 基于函数的指令系统
**实现**：
```typescript
type DirectiveFunction = (element: any, value: any, context: any) => void;

const ifDirective: DirectiveFunction = (element, value) => {
    if (value) {
        element.show();
    } else {
        element.hide();
    }
};
```

**特点**：
- 函数式风格
- 简单直接
- 难以管理生命周期
- 扩展性较差

## 3️⃣ ANALYSIS

### 响应式系统实现对比

| Criterion | Proxy-based | Object.defineProperty | 手动通知 |
|-----------|-------------|----------------------|----------|
| **性能** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **易用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **兼容性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **API 简洁性** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **自动依赖追踪** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **数组支持** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **深层对象支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Key Insights**:
- Proxy-based 提供最佳的开发体验和性能平衡
- Object.defineProperty 兼容性好但性能较差
- 手动通知性能最好但不符合响应式编程习惯
- Proxy 支持数组和深层对象，Object.defineProperty 不支持数组索引

### 数据绑定实现对比

| Criterion | 自动绑定 | 手动绑定 | 混合方案 |
|-----------|---------|---------|---------|
| **易用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **性能** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **灵活性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **API 简洁性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **生命周期管理** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

**Key Insights**:
- 自动绑定提供最佳开发体验
- 手动绑定性能最好但需要更多代码
- 混合方案平衡性能和易用性
- 自动绑定适合大多数场景

### API 设计对比

| Criterion | 类式 API | 函数式 API | 混合方案 |
|-----------|---------|-----------|---------|
| **代码风格一致性** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **易用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **可测试性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **扩展性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Key Insights**:
- 类式 API 与现有代码风格（ECS、FSM）一致
- 函数式 API 易于测试但不符合现有风格
- 混合方案提供最佳灵活性
- 类式 API 为主，提供工厂函数作为补充

### 指令系统设计对比

| Criterion | 基于类 | 基于函数 |
|-----------|--------|---------|
| **扩展性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **生命周期管理** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **代码风格一致性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **易用性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Key Insights**:
- 基于类的设计易于扩展和管理生命周期
- 基于函数的设计简单直接但难以管理
- 基于类的设计符合现有代码风格

## 4️⃣ DECISION

### 决策 1: 响应式系统实现

**Selected**: Option A - Proxy-based

**Rationale**: 
- 提供最佳的开发体验和性能平衡
- 自动依赖追踪，API 简洁
- 支持数组和深层对象
- 现代浏览器支持良好（IE 不支持，但项目不要求 IE 支持）
- 符合响应式编程习惯

### 决策 2: 数据绑定实现

**Selected**: Option A - 基于 Proxy 的自动绑定

**Rationale**: 
- 提供最佳开发体验
- 自动追踪依赖，自动更新视图
- 使用简单，符合 MVVM 模式
- 性能开销可接受（通过批量更新优化）

### 决策 3: API 设计

**Selected**: Option C - 混合方案（类式 API 为主）

**Rationale**: 
- 类式 API 与现有代码风格（ECS、FSM）一致
- 提供工厂函数作为补充，增加灵活性
- 支持泛型，类型安全
- 易于扩展和维护

### 决策 4: 指令系统设计

**Selected**: Option A - 基于类的指令系统

**Rationale**: 
- 基于类的设计易于扩展
- 明确的生命周期（execute、update、destroy）
- 类型安全
- 符合现有代码风格

## 5️⃣ IMPLEMENTATION NOTES

### 5.1 类型定义

**核心类型**：
```typescript
/**
 * 响应式数据接口
 */
export interface IReactive<T> {
    readonly value: T;
    watch(watcher: Watcher): () => void;
    unwatch(watcher: Watcher): void;
}

/**
 * 视图接口（框架无关）
 */
export interface IView {
    update(path: string, value: any): void;
    get(path: string): any;
    set(path: string, value: any): void;
    on(event: string, callback: (...args: any[]) => void): () => void;
    destroy(): void;
}

/**
 * 数据模型接口
 */
export interface IModel {
    readonly data: any;
    validate(): boolean;
    toJSON(): any;
    fromJSON(json: any): void;
}

/**
 * 视图模型接口
 */
export interface IViewModel {
    readonly model: IModel;
    readonly reactive: IReactive<any>;
    bind(path: string, view: IView, options?: BindingOptions): DataBinding;
    unbind(binding: DataBinding): void;
    destroy(): void;
}

/**
 * 绑定选项
 */
export interface BindingOptions {
    /** 绑定方向：'one-way' | 'two-way' | 'one-way-to-source' */
    mode?: 'one-way' | 'two-way' | 'one-way-to-source';
    /** 转换函数 */
    converter?: (value: any) => any;
    /** 验证函数 */
    validator?: (value: any) => boolean;
}
```

### 5.2 Reactive 类实现

**API 签名**：
```typescript
/**
 * 响应式数据
 * 
 * 使用 Proxy 实现自动依赖追踪和更新通知
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({ name: 'John', age: 30 });
 * 
 * // 创建观察者
 * const watcher = new Watcher(() => {
 *     console.log('Name changed:', reactive.value.name);
 * });
 * 
 * // 监听变化
 * reactive.watch(watcher);
 * 
 * // 修改值（自动触发更新）
 * reactive.value.name = 'Jane'; // 输出: Name changed: Jane
 * ```
 */
export class Reactive<T> implements IReactive<T> {
    private _value: T;
    private _proxy: T;
    private watchers: Set<Watcher> = new Set();
    private dependencyTracker: DependencyTracker;
    
    constructor(value: T) {
        this._value = value;
        this.dependencyTracker = new DependencyTracker();
        this._proxy = this._createProxy(value);
    }
    
    get value(): T {
        return this._proxy;
    }
    
    watch(watcher: Watcher): () => void {
        this.watchers.add(watcher);
        return () => this.unwatch(watcher);
    }
    
    unwatch(watcher: Watcher): void {
        this.watchers.delete(watcher);
    }
    
    private _createProxy(target: T): T {
        // Proxy 实现
    }
    
    private _triggerUpdate(key: string | symbol, newValue: any, oldValue: any): void {
        // 批量更新优化
        this._batchUpdate(() => {
            this.watchers.forEach(watcher => {
                watcher.update(key, newValue, oldValue);
            });
        });
    }
}
```

### 5.3 ViewModel 类实现

**API 签名**：
```typescript
/**
 * 视图模型
 * 
 * 连接 Model 和 View，管理数据绑定
 * 
 * @example
 * ```typescript
 * class PlayerViewModel extends ViewModel {
 *     constructor() {
 *         super(new PlayerModel({ name: 'John', health: 100 }));
 *         
 *         // 绑定数据到视图
 *         this.bind('name', view, { mode: 'two-way' });
 *         this.bind('health', view, { mode: 'one-way' });
 *     }
 * }
 * ```
 */
export class ViewModel implements IViewModel {
    protected model: IModel;
    protected reactive: Reactive<any>;
    private bindings: DataBinding[] = [];
    
    constructor(model: IModel) {
        this.model = model;
        this.reactive = new Reactive(model.data);
    }
    
    bind(path: string, view: IView, options?: BindingOptions): DataBinding {
        const binding = new DataBinding(this.reactive, view, path, options);
        this.bindings.push(binding);
        return binding;
    }
    
    unbind(binding: DataBinding): void {
        const index = this.bindings.indexOf(binding);
        if (index !== -1) {
            this.bindings.splice(index, 1);
            binding.destroy();
        }
    }
    
    destroy(): void {
        this.bindings.forEach(binding => binding.destroy());
        this.bindings = [];
    }
}
```

### 5.4 Model 类实现

**API 签名**：
```typescript
/**
 * 数据模型
 * 
 * 管理应用数据和业务逻辑
 * 
 * @example
 * ```typescript
 * class PlayerModel extends Model {
 *     constructor(data: any) {
 *         super(data);
 *     }
 *     
 *     validate(): boolean {
 *         return this.data.health >= 0 && this.data.health <= 100;
 *     }
 * }
 * ```
 */
export class Model implements IModel {
    protected _data: any;
    
    constructor(data: any) {
        this._data = data;
    }
    
    get data(): any {
        return this._data;
    }
    
    validate(): boolean {
        return true; // 子类实现
    }
    
    toJSON(): any {
        return JSON.parse(JSON.stringify(this._data));
    }
    
    fromJSON(json: any): void {
        this._data = json;
    }
}
```

### 5.5 DataBinding 类实现

**API 签名**：
```typescript
/**
 * 数据绑定
 * 
 * 连接响应式数据和视图
 * 
 * @example
 * ```typescript
 * const binding = new DataBinding(reactive, view, 'name', {
 *     mode: 'two-way',
 *     converter: (value) => value.toUpperCase()
 * });
 * ```
 */
export class DataBinding {
    private reactive: Reactive<any>;
    private view: IView;
    private path: string;
    private options: BindingOptions;
    private watcher: Watcher;
    private unsubscribe?: () => void;
    
    constructor(
        reactive: Reactive<any>,
        view: IView,
        path: string,
        options?: BindingOptions
    ) {
        this.reactive = reactive;
        this.view = view;
        this.path = path;
        this.options = { mode: 'one-way', ...options };
        
        this._setupBinding();
    }
    
    private _setupBinding(): void {
        // 设置绑定
    }
    
    destroy(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
```

### 5.6 指令系统实现

**API 签名**：
```typescript
/**
 * 指令基类
 */
export abstract class Directive {
    abstract execute(element: any, value: any, context: any): void;
    abstract update(element: any, value: any, oldValue: any, context: any): void;
    abstract destroy(element: any): void;
}

/**
 * 条件渲染指令
 */
export class IfDirective extends Directive {
    execute(element: any, value: boolean, context: any): void {
        if (value) {
            element.show();
        } else {
            element.hide();
        }
    }
    
    update(element: any, value: boolean, oldValue: boolean, context: any): void {
        if (value !== oldValue) {
            this.execute(element, value, context);
        }
    }
    
    destroy(element: any): void {
        // 清理
    }
}
```

### 5.7 Cocos Creator 集成

**CocosViewAdapter 实现**：
```typescript
/**
 * Cocos Creator 视图适配器
 */
export class CocosViewAdapter implements IView {
    private node: cc.Node;
    
    constructor(node: cc.Node) {
        this.node = node;
    }
    
    update(path: string, value: any): void {
        // 更新 Cocos Creator Node
        const component = this._getComponent(path);
        if (component) {
            component[path] = value;
        }
    }
    
    get(path: string): any {
        const component = this._getComponent(path);
        return component ? component[path] : undefined;
    }
    
    set(path: string, value: any): void {
        this.update(path, value);
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        // Cocos Creator 事件绑定
        this.node.on(event, callback);
        return () => this.node.off(event, callback);
    }
    
    destroy(): void {
        // 清理
    }
}
```

### 5.8 批量更新优化

**实现策略**：
```typescript
class Reactive<T> {
    private updateQueue: Set<Watcher> = new Set();
    private isUpdating: boolean = false;
    
    private _batchUpdate(callback: () => void): void {
        if (this.isUpdating) {
            callback();
            return;
        }
        
        this.isUpdating = true;
        try {
            callback();
            // 使用 nextTick 批量执行更新
            this._flushUpdates();
        } finally {
            this.isUpdating = false;
            this.updateQueue.clear();
        }
    }
    
    private _flushUpdates(): void {
        // 批量执行更新
        this.updateQueue.forEach(watcher => {
            watcher.run();
        });
    }
}
```

### 5.9 依赖追踪实现

**DependencyTracker 实现**：
```typescript
/**
 * 依赖追踪器
 */
export class DependencyTracker {
    private currentWatcher: Watcher | null = null;
    private dependencies: Map<string | symbol, Set<Watcher>> = new Map();
    
    track(key: string | symbol): void {
        if (this.currentWatcher) {
            if (!this.dependencies.has(key)) {
                this.dependencies.set(key, new Set());
            }
            this.dependencies.get(key)!.add(this.currentWatcher);
        }
    }
    
    trigger(key: string | symbol): void {
        const watchers = this.dependencies.get(key);
        if (watchers) {
            watchers.forEach(watcher => watcher.run());
        }
    }
    
    setCurrentWatcher(watcher: Watcher | null): void {
        this.currentWatcher = watcher;
    }
}
```

### 5.10 命名空间导出

**类似 ECS 模块的导出方式**：
```typescript
/**
 * MVVM 命名空间对象
 */
export const MVVM = {
    // 核心类
    Reactive,
    ViewModel,
    Model,
    DataBinding,
    
    // 工具类
    Watcher,
    DependencyTracker,
    Command,
    Computed,
    
    // 指令
    Directive,
    IfDirective,
    ForDirective,
    OnDirective,
    BindDirective,
    
    // 工厂函数
    createReactive,
    createViewModel,
    createModel,
} as const;

export default MVVM;
```

## 6️⃣ VERIFICATION

VERIFICATION:
- [x] 问题 clearly defined
- [x] Multiple options considered
- [x] Decision made with rationale
- [x] Implementation guidance provided
- [x] API 设计完整
- [x] 类型定义完整
- [x] 与现有代码风格一致
- [x] 性能优化考虑

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CREATIVE PHASE END
