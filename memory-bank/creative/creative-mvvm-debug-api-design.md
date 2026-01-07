# 🎨 CREATIVE: MVVM 调试 API 设计

## 任务信息

- **任务ID**: MVVM-DEBUG-001-CREATIVE-1
- **CREATIVE 类型**: API Design / Data Structure Design
- **创建日期**: 2025-01-XX
- **设计者**: AI Assistant

---

## 🎯 问题陈述

### 当前问题

MVVM 框架缺乏统一的调试 API，开发者无法方便地查询和监控框架内部状态：

1. **状态查询困难**：无法查询 Reactive、ViewModel、DataBinding 的当前状态
2. **数据结构不统一**：不同组件的状态信息格式不一致
3. **调试入口分散**：需要在多个地方调用不同的方法才能获取完整信息
4. **类型安全缺失**：调试 API 缺乏类型定义，容易出错

### 需求

1. **统一调试 API**：提供统一的入口查询所有调试信息
2. **类型安全**：所有调试 API 都有完整的 TypeScript 类型定义
3. **易于使用**：API 设计应该直观、易用
4. **性能友好**：调试 API 不应影响生产环境性能
5. **可扩展**：API 设计应该支持未来扩展

### 约束

1. **向后兼容**：不能破坏现有 API
2. **可选性**：调试功能应该是可选的，通过环境变量或配置控制
3. **零运行时依赖**：不能引入新的运行时依赖
4. **类型安全**：充分利用 TypeScript 类型系统

---

## 🔍 方案探索

### 方案 1: 静态方法 API（推荐）

**核心思路**：使用静态方法提供全局调试 API，通过实例引用访问状态。

**API 设计**：
```typescript
class Debugger {
    // 启用/禁用
    static enable(): void;
    static disable(): void;
    static isEnabled(): boolean;
    
    // 状态查询
    static getReactiveState<T>(reactive: Reactive<T>): ReactiveState<T>;
    static getViewModelState<T>(viewModel: ViewModel<T>): ViewModelState<T>;
    static getBindingState<T, TV, TView>(binding: DataBinding<T, TV, TView>): BindingState;
    
    // 依赖追踪
    static getDependencyGraph<T>(reactive: Reactive<T>): DependencyGraph;
    static getWatcherDependencies(watcher: Watcher): string[];
}

// 状态数据结构
interface ReactiveState<T> {
    value: T;
    watchers: WatcherInfo[];
    dependencyGraph: DependencyGraph;
    updateCount: number;
    lastUpdateTime: number;
}

interface ViewModelState<T> {
    model: ModelSnapshot<T>;
    bindings: BindingInfo[];
    bindingCount: number;
    lastBindingTime: number;
}

interface BindingState {
    path: string;
    mode: 'one-way' | 'two-way' | 'one-way-to-source';
    viewType: string;
    isActive: boolean;
    updateCount: number;
    lastUpdateTime: number;
    error?: ErrorInfo;
}
```

**优点**：
- ✅ 统一的 API 入口
- ✅ 类型安全（泛型支持）
- ✅ 易于使用（静态方法，无需实例化）
- ✅ 清晰的职责分离

**缺点**：
- ⚠️ 需要传入实例引用（但这是必要的）

**适用场景**：推荐用于所有场景

---

### 方案 2: 实例方法 API

**核心思路**：在 Reactive、ViewModel、DataBinding 上添加调试方法。

**API 设计**：
```typescript
class Reactive<T> {
    getDebugState(): ReactiveState<T>;
    getDependencyGraph(): DependencyGraph;
}

class ViewModel<T> {
    getDebugState(): ViewModelState<T>;
    getBindings(): BindingInfo[];
}

class DataBinding<T, TV, TView> {
    getDebugState(): BindingState;
}
```

**优点**：
- ✅ 方法在实例上，更符合 OOP 风格
- ✅ 不需要传入实例引用

**缺点**：
- ❌ 修改核心类，可能影响现有代码
- ❌ API 分散，不够统一
- ❌ 需要修改多个核心类

**适用场景**：不推荐，违反"不破坏现有 API"原则

---

### 方案 3: 混合方案（静态 + 实例方法）

**核心思路**：核心类提供基础调试方法，Debugger 提供高级功能。

**API 设计**：
```typescript
// 核心类提供基础方法
class Reactive<T> {
    private _getDebugState(): ReactiveState<T>; // 私有方法
}

// Debugger 提供统一 API
class Debugger {
    static getReactiveState<T>(reactive: Reactive<T>): ReactiveState<T> {
        return reactive._getDebugState();
    }
}
```

**优点**：
- ✅ 结合两种方案的优点
- ✅ 核心类不暴露公共 API
- ✅ Debugger 提供统一入口

**缺点**：
- ⚠️ 需要修改核心类（但使用私有方法，不影响公共 API）

**适用场景**：可以作为备选方案

---

## 📊 方案对比

| 特性 | 方案 1: 静态方法 | 方案 2: 实例方法 | 方案 3: 混合方案 |
|------|----------------|-----------------|-----------------|
| **统一性** | ✅ 高 | ❌ 低 | ✅ 高 |
| **类型安全** | ✅ 是 | ✅ 是 | ✅ 是 |
| **易用性** | ✅ 高 | ⚠️ 中 | ✅ 高 |
| **向后兼容** | ✅ 是 | ⚠️ 需要修改核心类 | ✅ 是（私有方法） |
| **性能影响** | ✅ 低 | ✅ 低 | ✅ 低 |
| **实现复杂度** | ✅ 低 | ⚠️ 中 | ⚠️ 中 |

---

## ✅ 推荐方案

**推荐方案：方案 1 - 静态方法 API**

**理由**：
1. **统一性**：提供统一的调试入口，所有调试功能都在 `Debugger` 类中
2. **向后兼容**：不需要修改核心类的公共 API
3. **易于使用**：静态方法，无需实例化，使用简单
4. **类型安全**：充分利用 TypeScript 泛型，提供类型安全
5. **实现简单**：只需要创建新的 `Debugger` 类，在核心类中添加私有调试钩子

---

## 🏗️ 实施方案

### 阶段 1: 数据结构设计

#### ReactiveState<T>

```typescript
interface ReactiveState<T> {
    /** 当前值 */
    value: T;
    
    /** Watcher 信息列表 */
    watchers: WatcherInfo[];
    
    /** 依赖关系图 */
    dependencyGraph: DependencyGraph;
    
    /** 更新统计 */
    stats: {
        updateCount: number;
        lastUpdateTime: number;
        averageUpdateTime: number;
    };
}

interface WatcherInfo {
    watcher: Watcher;
    dependencies: string[];
    runCount: number;
    lastRunTime: number;
    isActive: boolean;
}
```

#### ViewModelState<T>

```typescript
interface ViewModelState<T> {
    /** 模型快照 */
    model: ModelSnapshot<T>;
    
    /** 绑定信息列表 */
    bindings: BindingInfo[];
    
    /** 绑定统计 */
    stats: {
        bindingCount: number;
        activeBindingCount: number;
        lastBindingTime: number;
    };
}

interface ModelSnapshot<T> {
    data: T;
    lastUpdateTime: number;
}

interface BindingInfo {
    path: string;
    mode: 'one-way' | 'two-way' | 'one-way-to-source';
    viewType: string;
    isActive: boolean;
    updateCount: number;
    lastUpdateTime: number;
    error?: ErrorInfo;
}
```

#### BindingState

```typescript
interface BindingState {
    /** 绑定路径 */
    path: string;
    
    /** 绑定模式 */
    mode: 'one-way' | 'two-way' | 'one-way-to-source';
    
    /** 视图类型 */
    viewType: string;
    
    /** 是否活跃 */
    isActive: boolean;
    
    /** 更新统计 */
    stats: {
        updateCount: number;
        lastUpdateTime: number;
        averageUpdateTime: number;
    };
    
    /** 错误信息（如果有） */
    error?: ErrorInfo;
}

interface ErrorInfo {
    message: string;
    stack: string[];
    timestamp: number;
    context?: any;
}
```

#### DependencyGraph

```typescript
interface DependencyGraph {
    /** 路径到依赖信息的映射 */
    paths: Map<string, PathDependencyInfo>;
    
    /** Watcher 到依赖信息的映射 */
    watchers: Map<Watcher, WatcherDependencyInfo>;
}

interface PathDependencyInfo {
    /** 依赖此路径的 Watcher 列表 */
    watchers: Watcher[];
    
    /** 此路径依赖的其他路径 */
    dependencies: string[];
    
    /** 依赖此路径的其他路径 */
    dependents: string[];
    
    /** 更新统计 */
    updateCount: number;
    lastUpdateTime: number;
}

interface WatcherDependencyInfo {
    /** 此 Watcher 依赖的路径列表 */
    dependencies: string[];
    
    /** 运行统计 */
    runCount: number;
    lastRunTime: number;
    averageRunTime: number;
}
```

### 阶段 2: Debugger 类设计

```typescript
/**
 * MVVM 调试器
 * 
 * 提供统一的调试 API，用于查询和监控 MVVM 框架内部状态
 * 
 * @example
 * ```typescript
 * // 启用调试
 * Debugger.enable();
 * 
 * // 查询 Reactive 状态
 * const state = Debugger.getReactiveState(reactive);
 * console.log('Current value:', state.value);
 * console.log('Watchers:', state.watchers.length);
 * 
 * // 查询 ViewModel 状态
 * const vmState = Debugger.getViewModelState(viewModel);
 * console.log('Bindings:', vmState.bindings.length);
 * 
 * // 查询依赖关系图
 * const graph = Debugger.getDependencyGraph(reactive);
 * console.log('Dependencies:', graph.paths);
 * ```
 */
export class Debugger {
    private static enabled: boolean = false;
    private static hooks: Map<object, DebugHook> = new Map();
    
    /**
     * 启用调试功能
     */
    static enable(): void {
        this.enabled = true;
    }
    
    /**
     * 禁用调试功能
     */
    static disable(): void {
        this.enabled = false;
        this.hooks.clear();
    }
    
    /**
     * 检查调试功能是否启用
     */
    static isEnabled(): boolean {
        return this.enabled;
    }
    
    /**
     * 获取 Reactive 状态
     */
    static getReactiveState<T>(reactive: Reactive<T>): ReactiveState<T> {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        const hook = this.hooks.get(reactive);
        if (!hook) {
            throw new Error('Reactive instance does not have debug hook. Make sure debug is enabled before creating Reactive.');
        }
        
        return hook.getState();
    }
    
    /**
     * 获取 ViewModel 状态
     */
    static getViewModelState<T>(viewModel: ViewModel<T>): ViewModelState<T> {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        const hook = this.hooks.get(viewModel);
        if (!hook) {
            throw new Error('ViewModel instance does not have debug hook. Make sure debug is enabled before creating ViewModel.');
        }
        
        return hook.getState();
    }
    
    /**
     * 获取 DataBinding 状态
     */
    static getBindingState<T, TV, TView>(
        binding: DataBinding<T, TV, TView>
    ): BindingState {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        const hook = this.hooks.get(binding);
        if (!hook) {
            throw new Error('DataBinding instance does not have debug hook. Make sure debug is enabled before creating DataBinding.');
        }
        
        return hook.getState();
    }
    
    /**
     * 获取依赖关系图
     */
    static getDependencyGraph<T>(reactive: Reactive<T>): DependencyGraph {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        const hook = this.hooks.get(reactive);
        if (!hook) {
            throw new Error('Reactive instance does not have debug hook.');
        }
        
        return hook.getDependencyGraph();
    }
    
    /**
     * 获取 Watcher 依赖
     */
    static getWatcherDependencies(watcher: Watcher): string[] {
        if (!this.enabled) {
            throw new Error('Debugger is not enabled. Call Debugger.enable() first.');
        }
        
        // 需要从 DependencyTracker 获取
        // 实现细节待定
        return [];
    }
    
    /**
     * 注册调试钩子（内部使用）
     */
    static registerHook(instance: object, hook: DebugHook): void {
        if (this.enabled) {
            this.hooks.set(instance, hook);
        }
    }
    
    /**
     * 注销调试钩子（内部使用）
     */
    static unregisterHook(instance: object): void {
        this.hooks.delete(instance);
    }
}
```

### 阶段 3: 调试钩子接口设计

```typescript
/**
 * 调试钩子接口
 * 
 * 核心类实现此接口以支持调试功能
 */
interface DebugHook {
    /**
     * 获取状态
     */
    getState(): any;
    
    /**
     * 获取依赖关系图（仅 Reactive 需要）
     */
    getDependencyGraph?(): DependencyGraph;
}

/**
 * Reactive 调试钩子
 */
class ReactiveDebugHook implements DebugHook {
    private reactive: Reactive<any>;
    private dependencyTracker: DependencyTracker;
    
    constructor(reactive: Reactive<any>, dependencyTracker: DependencyTracker) {
        this.reactive = reactive;
        this.dependencyTracker = dependencyTracker;
    }
    
    getState(): ReactiveState<any> {
        return {
            value: this.reactive.value,
            watchers: this.getWatcherInfos(),
            dependencyGraph: this.getDependencyGraph(),
            stats: this.getStats()
        };
    }
    
    getDependencyGraph(): DependencyGraph {
        // 从 DependencyTracker 构建依赖关系图
        // 实现细节待定
        return {
            paths: new Map(),
            watchers: new Map()
        };
    }
    
    private getWatcherInfos(): WatcherInfo[] {
        // 实现细节待定
        return [];
    }
    
    private getStats() {
        // 实现细节待定
        return {
            updateCount: 0,
            lastUpdateTime: 0,
            averageUpdateTime: 0
        };
    }
}
```

---

## 🔧 实施指南

### 步骤 1: 创建类型定义文件

**文件**: `packages/mvvm/src/debug/types.ts`

```typescript
// 定义所有调试相关的类型
export interface ReactiveState<T> { ... }
export interface ViewModelState<T> { ... }
export interface BindingState { ... }
export interface DependencyGraph { ... }
// ... 其他类型
```

### 步骤 2: 实现 Debugger 类

**文件**: `packages/mvvm/src/debug/Debugger.ts`

```typescript
import type { ReactiveState, ViewModelState, BindingState, DependencyGraph } from './types';
import type { Reactive } from '../reactive/Reactive';
import type { ViewModel } from '../core/ViewModel';
import type { DataBinding } from '../binding/DataBinding';
import type { Watcher } from '../reactive/Watcher';

export class Debugger {
    // 实现所有静态方法
}
```

### 步骤 3: 在核心类中添加调试钩子

**修改**: `packages/mvvm/src/reactive/Reactive.ts`

```typescript
import { Debugger } from '../debug/Debugger';
import { ReactiveDebugHook } from '../debug/hooks/ReactiveDebugHook';

class Reactive<T> {
    private debugHook?: ReactiveDebugHook;
    
    constructor(value: T) {
        // ...
        if (Debugger.isEnabled()) {
            this.debugHook = new ReactiveDebugHook(this, this.dependencyTracker);
            Debugger.registerHook(this, this.debugHook);
        }
    }
    
    destroy(): void {
        if (this.debugHook) {
            Debugger.unregisterHook(this);
        }
        // ... 原有逻辑
    }
}
```

### 步骤 4: 导出调试 API

**修改**: `packages/mvvm/src/index.ts`

```typescript
// 调试工具（可选）
export { Debugger } from './debug/Debugger';
export type {
    ReactiveState,
    ViewModelState,
    BindingState,
    DependencyGraph
} from './debug/types';
```

---

## ⚠️ 风险点

1. **性能影响**
   - **风险**：调试钩子可能影响性能
   - **缓解**：使用 `Debugger.isEnabled()` 检查，禁用时跳过所有调试代码
   - **验证**：性能测试

2. **内存泄漏**
   - **风险**：调试钩子可能持有实例引用，导致内存泄漏
   - **缓解**：在 `destroy()` 中注销钩子
   - **验证**：内存测试

3. **类型安全**
   - **风险**：调试 API 可能破坏类型安全
   - **缓解**：使用泛型和类型守卫
   - **验证**：TypeScript 编译检查

---

## ✅ 验收标准

1. **API 完整性**
   - ✅ 所有状态查询 API 都已实现
   - ✅ 所有 API 都有完整的类型定义
   - ✅ API 使用简单直观

2. **类型安全**
   - ✅ TypeScript 编译无错误
   - ✅ 所有 API 都有类型提示
   - ✅ 泛型支持正确

3. **性能**
   - ✅ 调试功能禁用时，性能影响 < 1%
   - ✅ 调试功能启用时，性能影响 < 5%

4. **向后兼容**
   - ✅ 不破坏现有 API
   - ✅ 现有测试用例全部通过

---

## 📝 实施任务清单

- [ ] 创建 `packages/mvvm/src/debug/types.ts` - 定义所有类型
- [ ] 创建 `packages/mvvm/src/debug/Debugger.ts` - 实现 Debugger 类
- [ ] 创建 `packages/mvvm/src/debug/hooks/ReactiveDebugHook.ts` - Reactive 调试钩子
- [ ] 创建 `packages/mvvm/src/debug/hooks/ViewModelDebugHook.ts` - ViewModel 调试钩子
- [ ] 创建 `packages/mvvm/src/debug/hooks/BindingDebugHook.ts` - DataBinding 调试钩子
- [ ] 修改 `packages/mvvm/src/reactive/Reactive.ts` - 添加调试钩子支持
- [ ] 修改 `packages/mvvm/src/core/ViewModel.ts` - 添加调试钩子支持
- [ ] 修改 `packages/mvvm/src/binding/DataBinding.ts` - 添加调试钩子支持
- [ ] 更新 `packages/mvvm/src/index.ts` - 导出调试 API
- [ ] 创建使用示例 `packages/mvvm/examples/debug-usage.ts`

---

**CREATIVE 模式状态**: ✅ **COMPLETE**

**推荐方案**: 方案 1 - 静态方法 API

**下一步**: 进入 BUILD 模式开始实现

