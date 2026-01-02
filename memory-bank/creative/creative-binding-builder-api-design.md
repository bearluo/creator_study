# 🎨 CREATIVE: BindingBuilder API 设计（实施方案）

## 任务信息
- **任务ID**: MVVM-CREATOR-005-CREATIVE-2
- **方案**: 2.1 - 延迟构建方案（最终版）
- **状态**: ✅ COMPLETE

---

## 🔒 跨模块硬性共识（不能破）

以下规则是跨模块的硬性约束，所有实现必须遵守：

1. **path 永远是数据路径**
   - `CocosViewAdapter.update(path, value)` 的 path 就是数据 path
   - mappings 的 key 是 dataPath（如 'stats.health'）
   - 不能把 viewPath 当 key，否则会导致映射冲突

2. **View 不解析 path**
   - ViewAdapter（TargetViewAdapter / CocosViewAdapter）只做映射，不解析路径
   - 所有路径解析必须在 Builder 阶段完成
   - Adapter 的 update/get 是 O(1) 的 Map 查找

3. **Builder 做一次性重活**
   - BindingBuilder 在 build() 时解析所有 nodePath + getComponent
   - 解析结果缓存（key: rootNodeUUID + ':' + nodePath）
   - build 时一次性 resolve 完成，mapping 存的是最终 Node/Component 引用

4. **Adapter 永远 O(1)**
   - Adapter 的 update/get 直接通过 Map<dataPath, mapping> 查找
   - 无需解析路径，无需遍历节点树
   - 性能关键：所有重活都在 Builder 阶段完成

5. **绑定清理必须落到 DataBinding.destroy()**
   - `DataBinding.destroy()` 是清理的核心点
   - 确保 reactive.watch 和 view.on 订阅都被清理
   - MVVMComponent 在 onDisable/onDestroy 调用 `binding.destroy()` 逐个释放
   - 否则会出现：组件销毁了，但 watcher 仍挂在 Reactive 上（内存泄露 + 访问已销毁组件）

6. **✅ 允许同 path 多个 target（规则变更）**
   - ✅ 同 path 可绑定多个 ViewTarget（display/input 都可）
   - ✅ 但 two-way 必须带 sourceId guard（否则禁止多 input）
   - ✅ change 事件必须带 sourceId（或等价机制）
   - ✅ DataBinding 增加 sourceId 字段，用于防回环
   - ✅ TargetViewAdapter 支持一个 path 多个 target，并传递 sourceId

---

## 📋 类型定义（方案 2.1 最终版）

```typescript
/**
 * 视图目标适配器接口
 */
export interface ViewTarget<TViewValue = any> {
    set(value: TViewValue): void;
    get?(): TViewValue;
    /** two-way 才实现：订阅视图变化，返回 unsubscribe */
    onChange?(cb: (value: TViewValue) => void): () => void;
    /** 只做解绑，不销毁节点 */
    dispose?(): void;  // 统一生命周期方法名为 dispose()（只做解绑，不销毁节点/组件）
}

/**
 * 绑定项配置
 */
type AnyPath<T> = Path<T> & string;

interface BindingItem<T, P extends AnyPath<T>> {
    path: P;
    target: ViewTarget<any>;
    options?: BindingOptions<PathValue<T, P>, any>;
}

/**
 * 绑定构建器（方案 2.1 - 最终推荐版）
 */
export class BindingBuilder<T> {
    private viewModel: ViewModel<T>;
    private items: BindingItem<T, AnyPath<T>>[] = [];
    private built = false;
    
    constructor(viewModel: ViewModel<T>) {
        this.viewModel = viewModel;
    }
    
    /**
     * 类型安全的数据绑定方法
     * 
     * @template P 路径类型（从 Path<T> 推断）
     * @template TV 视图值类型（从 ViewTarget 推断）
     * @param path 数据路径（类型安全）
     * @param target 视图目标适配器（ViewTarget）
     * @param options 绑定选项（可选，TViewValue 类型从 target 推断）
     * @returns this（支持链式调用）
     */
    bind<P extends AnyPath<T>, TV>(
        path: P,
        target: ViewTarget<TV>,
        options?: BindingOptions<PathValue<T, P>, TV>
    ): this {
        this.items.push({ path, target, options } as any);
        return this;
    }
    
    /**
     * 构建所有绑定
     * 
     * @returns { bindings: DataBinding 数组; view: TargetViewAdapter }
     * 
     * 注意：build() 只允许调用一次
     * 如果要重新 build：新建 builder 或 builder.clear() 重新配置
     * 
     * 性能：允许 bindMany，但前置重复检测；否则用逐个 bind
     */
    build(): { bindings: DataBinding<T, any, any>[]; view: TargetViewAdapter } {
        if (this.built) {
            throw new Error('[BindingBuilder] build() called twice. Use clear() or create a new builder.');
        }
        
        // 重复 path 检测（防 Record 覆盖）
        const seen = new Set<string>();
        for (const item of this.items) {
            if (seen.has(item.path)) {
                throw new Error(
                    `[BindingBuilder] Duplicate binding path: ${item.path}. ` +
                    `Each path can only be bound once.`
                );
            }
            seen.add(item.path);
        }
        
        // 创建共享的 TargetViewAdapter
        const view = new TargetViewAdapter();
        
        // 把所有 target 注册进 adapter
        for (const item of this.items) {
            view.addTarget(item.path, item.target);
        }
        
        // 性能：允许 bindMany，但前置重复检测；否则用逐个 bind
        // 由于已经做了重复 path 检测，可以使用 bindMany 优化性能
        const bindingsConfig: Partial<Record<Path<T> & string, BatchBindingItem<T, Path<T> & string>>> = {};
        for (const item of this.items) {
            bindingsConfig[item.path] = {
                view: view,
                options: item.options
            };
        }
        
        // ⚠️ **风险控制**：如果 build 中途 throw，需要确保不会残留 UI 事件监听或 watcher
        // 策略：先创建所有 bindings，再标记 built，确保原子性
        let createdBindings: DataBinding<T, any, any>[] = [];
        
        try {
            // 使用 bindMany 批量创建绑定（已前置重复检测，安全）
            const bindingsMap = this.viewModel.bindMany(
                bindingsConfig as Record<Path<T> & string, BatchBindingItem<T, Path<T> & string>>
            );
            
            // 转换为数组
            createdBindings = Array.from(bindingsMap.values());
            
            // 只有全部成功后才标记 built
            this.built = true;
            return { bindings: createdBindings, view };
        } catch (error) {
            // build 失败时的半成品清理策略
            // 1. 销毁已创建的 bindings（如果有）
            for (const binding of createdBindings) {
                binding.destroy();
            }
            
            // 2. 销毁已创建的 view（会解绑所有已注册的 onChange）
            view.destroy();
            
            // 3. 重置 built 标志
            this.built = false;
            
            // 4. 重新抛出错误
            throw error;
        }
    }
    
    /**
     * 清空配置（不自动 destroy 外部资源）
     * 
     * ⚠️ **重要**：clear() 只清空配置，不负责销毁外部资源（bindings/view 的销毁交给 MVVMComponent）
     * 
     * **使用场景**：
     * - 推荐：builder 只用于 MVVMComponent 管理场景
     * - 独立使用：如需独立使用 builder，必须在 clear() 前手动销毁当前 bindings 和 view
     * 
     * 重新 enable：builder.clear(); 重新 bind...; build()
     */
    clear(): void {
        this.items.length = 0;
        this.built = false;
    }
}
```

---

## 🔧 实施指南

### 步骤 1: 定义 ViewTarget 接口

```typescript
// types/view-target.ts
export interface ViewTarget<TViewValue = any> {
    set(value: TViewValue): void;
    get?(): TViewValue;
    onChange?(callback: (value: TViewValue) => void): () => void;
    dispose?(): void;  // 统一生命周期方法名为 dispose()（只做解绑，不销毁节点/组件）
}
```

### 步骤 2: 实现辅助函数

```typescript
// helpers/view-targets.ts
import { Label, ProgressBar, EditBox, Toggle, Slider, Node } from 'cc';
import type { ViewTarget } from '../types/view-target';

/**
 * 创建 Label 目标适配器（字符串，强类型）
 */
export function toLabelText(label: Label | null): ViewTarget<string> {
    if (!label) {
        throw new Error('[toLabelText] Label is null');
    }
    return {
        set: (value: string) => {
            label.string = value;
        },
        get: () => label.string
    };
}

/**
 * 创建 Label 目标适配器（带格式化，只 set，不 get）
 */
export function toLabelFmt<T>(label: Label | null, fmt: (v: T) => string): ViewTarget<T> {
    if (!label) {
        throw new Error('[toLabelFmt] Label is null');
    }
    return {
        set: (value: T) => {
            label.string = fmt(value);
        }
        // 不提供 get，避免类型污染
    };
}

/**
 * 创建 ProgressBar 目标适配器
 */
export function toProgress(
    progressBar: ProgressBar | null,
    converter?: (value: number) => number
): ViewTarget<number> {
    if (!progressBar) {
        throw new Error('[toProgress] ProgressBar is null');
    }
    return {
        set: (value: number) => {
            progressBar.progress = converter ? converter(value) : value;
        },
        get: () => progressBar.progress
    };
}

/**
 * 创建 Node.active 目标适配器
 */
export function toActive(node: Node | null): ViewTarget<boolean> {
    if (!node) {
        throw new Error('[toActive] Node is null');
    }
    return {
        set: (value: boolean) => {
            node.active = value;
        },
        get: () => node.active
    };
}

/**
 * 创建 EditBox 目标适配器（支持 two-way）
 */
export function toEditBox(
    editBox: EditBox | null,
    options?: { event?: EditBoxEventType }
): ViewTarget<string> {
    if (!editBox) {
        throw new Error('[toEditBox] EditBox is null');
    }
    
    let silentDepth = 0;  // 静默保护：用计数器更稳
    
    return {
        set: (value: string) => {
            silentDepth++;
            try {
                editBox.string = value;
            } finally {
                silentDepth--;
            }
        },
        get: () => editBox.string,
        onChange: (callback: (value: string) => void) => {
            const eventType = options?.event || EditBox.EventType.EDITING_DID_ENDED;
            const handler = () => {
                if (silentDepth > 0) return;  // 静默保护
                callback(editBox.string);
            };
            editBox.node.on(eventType, handler);
            return () => {
                editBox.node.off(eventType, handler);
            };
        }
    };
}

/**
 * 创建 Toggle 目标适配器（支持 two-way）
 */
export function toToggle(toggle: Toggle | null): ViewTarget<boolean> {
    if (!toggle) {
        throw new Error('[toToggle] Toggle is null');
    }
    
    let silentDepth = 0;  // 静默保护：用计数器更稳
    
    return {
        set: (value: boolean) => {
            silentDepth++;
            try {
                toggle.isChecked = value;
            } finally {
                silentDepth--;
            }
        },
        get: () => toggle.isChecked,
        onChange: (callback: (value: boolean) => void) => {
            const handler = () => {
                if (silentDepth > 0) return;  // 静默保护
                callback(toggle.isChecked);
            };
            toggle.node.on(Toggle.EventType.TOGGLE, handler);
            return () => {
                toggle.node.off(Toggle.EventType.TOGGLE, handler);
            };
        }
    };
}

/**
 * 创建 Slider 目标适配器（支持 two-way）
 */
export function toSlider(slider: Slider | null): ViewTarget<number> {
    if (!slider) {
        throw new Error('[toSlider] Slider is null');
    }
    
    let silentDepth = 0;  // 静默保护：用计数器更稳
    
    return {
        set: (value: number) => {
            silentDepth++;
            try {
                slider.progress = value;
            } finally {
                silentDepth--;
            }
        },
        get: () => slider.progress,
        onChange: (callback: (value: number) => void) => {
            const handler = () => {
                if (silentDepth > 0) return;  // 静默保护
                callback(slider.progress);
            };
            slider.node.on(Slider.EventType.SLIDING, handler);
            return () => {
                slider.node.off(Slider.EventType.SLIDING, handler);
            };
        }
    };
}
```

### 步骤 3: 实现 BindingBuilder

使用上面的类型定义和实现。

### 步骤 4: 实现 TargetViewAdapter

```typescript
// adapters/TargetViewAdapter.ts
export class TargetViewAdapter implements IView {
    private targets = new Map<string, ViewTarget<any>>();
    private changeListeners = new Set<(path: string, value: any) => void>();
    private onChangeUnsubs = new Map<string, () => void>();
    
    /**
     * 添加目标（注册到映射表）
     */
    addTarget<P extends string>(path: P, target: ViewTarget<any>): void {
        if (this.targets.has(path)) {
            throw new Error(`[TargetViewAdapter] Duplicate target for path: ${path}`);
        }
        
        this.targets.set(path, target);
        
        // 如果 target 支持 onChange，注册监听
        if (target.onChange) {
            const unsub = target.onChange((value: any) => {
                this._emitChange(path, value);
            });
            this.onChangeUnsubs.set(path, unsub);
        }
    }
    
    /**
     * 移除目标（解绑事件）
     */
    removeTarget(path: string): void {
        const unsub = this.onChangeUnsubs.get(path);
        if (unsub) {
            unsub();
            this.onChangeUnsubs.delete(path);
        }
        
        const target = this.targets.get(path);
        if (target) {
            target.dispose?.();
        }
        
        this.targets.delete(path);
    }
    
    update(path: string, value: any): void {
        const target = this.targets.get(path);
        if (target) {
            target.set(value);
        }
    }
    
    get(path: string): any {
        const target = this.targets.get(path);
        return target?.get?.();
    }
    
    set(path: string, value: any): void {
        this.update(path, value);
        this._emitChange(path, value);
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        if (event === 'change') {
            const fn = callback as (path: string, value: any) => void;
            this.changeListeners.add(fn);
            return () => {
                this.changeListeners.delete(fn);
            };
        }
        console.warn(`[TargetViewAdapter] Unsupported event "${event}"`);
        return () => {};
    }
    
    destroy(): void {
        // 安全迭代（避免 map 修改问题）
        const paths = Array.from(this.targets.keys());
        for (const path of paths) {
            this.removeTarget(path);
        }
        
        this.changeListeners.clear();
    }
    
    private _emitChange(path: string, value: any): void {
        for (const callback of this.changeListeners) {
            callback(path, value);
        }
    }
}
```

---

## 📋 使用示例

### 推荐方式：使用辅助函数（类型安全，易用）

```typescript
// 在 MVVMComponent 中使用
protected onMVVMCreate(): void {
    // 配置绑定规则（不调用 build()）
    this.bindingBuilder
        .bind('name', toLabelText(this.nameLabel!))  // 使用 toLabelText（强类型）
        .bind('level', toLabelFmt(this.levelLabel!, (v: number) => `Lv.${v}`))  // 使用 toLabelFmt（带格式化）
        .bind('stats.health', toProgress(this.hpBar!, v => v/100))
        .bind('isDead', toActive(this.deadMask!))
        .bind('playerName', toEditBox(this.nameInput!), { mode: 'two-way' });
    // build() 会在基类的 onEnable() 中调用
}

// 在 onEnable() 中（基类自动调用）
// const { bindings, view } = this.bindingBuilder.build();
// this.bindings = bindings;
// this.view = view;

// 在 onDisable() 中（基类自动调用）
// for (const binding of this.bindings) binding.destroy();  // 解绑 reactive.watch
// this.view.destroy();  // 解绑 UI 事件

// 在 onDestroy() 中（基类自动调用）
// for (const binding of this.bindings) binding.destroy();
// this.view.destroy();
// this.bindingBuilder.clear();  // 清空配置
```

### 重新 enable 处理（推荐最终使用方式）

```typescript
// 错误：重复 build
const { bindings: bindings1, view: view1 } = builder.build();
const { bindings: bindings2, view: view2 } = builder.build(); // ❌ 抛出错误

// 正确：清空后重新配置
builder.clear();  // 清空配置（不自动 destroy 外部资源）
builder.bind('name', toLabelText(this.nameLabel!));
const { bindings, view } = builder.build(); // ✅ 重新创建

// 或者：创建新的 builder
const builder2 = new BindingBuilder(viewModel);
builder2.bind('name', toLabelText(this.nameLabel!));
const { bindings, view } = builder2.build();

// MVVMComponent.onDisable/onDestroy:
for (const b of bindings) b.destroy();  // 解绑 reactive.watch
view.destroy();  // 解绑 UI 事件
```

---

## 📝 最终规范总结（方案 2.1）

### BindingBuilder.build() 返回类型（最终规范）

**build() 必须返回 { bindings, view }**，用于后续清理：

```typescript
build(): { bindings: DataBinding<T, any, any>[]; view: TargetViewAdapter } {
    // 检测重复 path
    // 创建共享 TargetViewAdapter
    // 性能：允许 bindMany，但前置重复检测；否则用逐个 bind
    return { bindings, view };
}
```

**原因**：
- MVVMComponent 需要在 onDisable/onDestroy 时调用 binding.destroy() 和 view.destroy()
- 确保 reactive.watch 和 view.on 订阅都被清理
- 避免内存泄露

### 重复 path 检测（最终规范）

**build() 时检测重复 path，抛出错误**：

```typescript
const seen = new Set<string>();
for (const item of this.items) {
    if (seen.has(item.path)) {
        throw new Error(`[BindingBuilder] Duplicate binding path: ${item.path}`);
    }
    seen.add(item.path);
}
```

**原因**：
- 避免 Record 覆盖问题
- 早期发现配置错误
- 提高调试效率

### 禁止重复 build（最终规范）

**使用 `built` 标志禁止重复 build**，只用 clear + 重新 build：

```typescript
build(): { bindings: DataBinding<T, any, any>[]; view: TargetViewAdapter } {
    if (this.built) {
        throw new Error('[BindingBuilder] build() called twice. Use clear() or create a new builder.');
    }
    // ...
    this.built = true;
    return { bindings, view };
}

clear(): void {
    this.items.length = 0;
    this.built = false;
}
```

**注意**：rebuild 不是 Builder 的职责。MVVMComponent 应该管理当前 bindings，在 onDisable/onDestroy 时统一 destroy，在 onEnable 时重新 build。

**原因**：
- 避免重复创建绑定
- 避免内存泄露
- 支持 enable/disable 场景（只用 clear + 重新 build）

### ViewTarget 接口（最终规范）

**使用 ViewTarget 接口替代 property/componentType 推断**：

```typescript
export interface ViewTarget<TViewValue = any> {
    set(value: TViewValue): void;
    get?(): TViewValue;
    onChange?(callback: (value: TViewValue) => void): () => void;
    dispose?(): void;  // 统一生命周期方法名为 dispose()（只做解绑，不销毁节点/组件）
}
```

**原因**：
- 彻底移除 property / componentType 字符串，类型安全
- IDE 自动补全支持
- 重构不易出错

### 辅助函数（最终规范）

**辅助函数分为两类**：

1. **"强类型视图值"目标（可 two-way）**
   - `toEditBox()`: `ViewTarget<string>`
   - `toToggle()`: `ViewTarget<boolean>`
   - `toSlider()`: `ViewTarget<number>`

2. **"显示型"目标（通常不需要 get）**
   - `toLabelText()`: `ViewTarget<string>`
   - `toLabelFmt<T>()`: `ViewTarget<T>`（只 set，不 get）
   - `toProgress()`: `ViewTarget<number>`
   - `toActive()`: `ViewTarget<boolean>`

**静默保护**：
- 输入控件（EditBox/Toggle/Slider）使用 `silentDepth` 计数器 + `try/finally`
- 严格保证同步回环被挡住

**异步回环防护**：
- ⚠️ **必须实现**：DataBinding 内需要实现"来源标记/版本号/dirty guard"机制
- 如果 mvvm 库里没有这个机制，需要在 BUILD 阶段明确实现策略
- 策略：在 DataBinding 中记录最后写入的来源（source/view），如果 change 事件来源与当前写入来源相同，则忽略
- 这是硬性要求，不能是空承诺

### 性能优化（最终规范）

**✅ 规则变更：改用逐个 bind，不再使用 bindMany**：
- 由于需要传递 sourceId，不能使用 bindMany（bindMany 不支持 sourceId）
- 改用逐个 `viewModel.bind()`，并为每个 binding 传递对应的 targetId 作为 sourceId
- 性能差异可忽略（真正重的是 watch/事件，而不是循环创建）

### 架构分工（最终规范）

**BindingBuilder 职责**：
- 收集绑定规则（链式 bind）
- ✅ **规则变更**：不再检测重复 path，允许同 path 多个 target
- 解析 nodePath + getComponent（一次性重活，带缓存）
- build 时创建 Adapter 映射 + DataBinding，并为每个 binding 传递 sourceId

**ViewAdapter（TargetViewAdapter / CocosViewAdapter）职责**：
- 统一事件总线（change 事件，支持 sourceId）
- ✅ **规则变更**：dataPath → view targets 映射（一个 path 可对应多个 target）
- 不解析 path，只做映射
- ✅ 为每个 target 分配唯一 targetId，并在 emitChange 时传递

**MVVMComponent 职责**：
- 管生命周期（enable/build，disable/destroy）
- 统一管理 bindings 和 view 的销毁

**DataBinding 职责**：
- reactive.watch（依赖收集和更新）
- two-way 防回环（syncingToView / syncingToSource）
- ✅ **规则变更**：增加 sourceId 字段，收到 change 时检查 sourceId，如果等于自己的 sourceId 则忽略（防止回环）

---

## ✅ 最终验收点（BUILD 前最后 check list）

1. **ViewTarget 接口彻底移除 property/componentType**
   - ✅ 使用 ViewTarget 接口，类型安全
   - ✅ 辅助函数提供类型安全的 API

2. **✅ 允许同 path 多个 target（规则变更）**
   - ✅ 不再禁止同 path 多个 target
   - ✅ 每个 target 都有唯一的 targetId（作为 sourceId）
   - ✅ two-way 绑定通过 sourceId guard 防止回环

3. **禁止重复 build**
   - ✅ 使用 `built` 标志禁止重复 build
   - ✅ 只用 clear + 重新 build

4. **build() 返回 { bindings, view }**
   - ✅ build() 必须返回 { bindings, view }
   - ✅ MVVMComponent 统一管理销毁

5. **性能优化**
   - ✅ 允许 bindMany，但前置重复检测
   - ✅ 使用 TargetViewAdapter，所有 binding 复用同一个 view

6. **ViewTarget.dispose() 统一生命周期方法名**
   - ✅ 统一生命周期方法名为 dispose()（只做解绑，不销毁节点/组件）

7. **静默保护**
   - ✅ 输入控件使用 silentDepth 计数器 + try/finally
   - ✅ 两层防护（ViewTarget + DataBinding）
   - ✅ 异步回环防护：DataBinding 内实现"来源标记/版本号/dirty guard"机制

8. **build 失败时的半成品清理**
   - ✅ build 中途 throw 时，确保不会残留 UI 事件监听或 watcher
   - ✅ 故意制造 duplicate path/空 target 时，确保不会残留

---

## 🧪 BUILD 验收用例（能快速证明没坑）

### 用例 1: 重复 path 检测

**测试场景**：
```typescript
const builder = new BindingBuilder(viewModel);
builder.bind('name', toLabelText(label1));
builder.bind('name', toLabelText(label2)); // 重复 path

// 预期：build() 直接 throw，且不会残留任何 UI 事件监听 / watcher
try {
    builder.build();
    throw new Error('Should throw');
} catch (e) {
    // 验证：没有 watcher 残留
    // 验证：没有 UI 事件监听残留
}
```

**验收标准**：
- ✅ build() 直接 throw `Duplicate binding path: name`
- ✅ 不会残留任何 UI 事件监听（TargetViewAdapter 未创建或已清理）
- ✅ 不会残留任何 watcher（DataBinding 未创建）

### 用例 2: build 失败时的半成品清理

**测试场景**：
```typescript
// 故意制造 duplicate path
builder.bind('name', toLabelText(label1));
builder.bind('name', toLabelText(label2));

try {
    builder.build();
} catch (e) {
    // 验证：已注册的 onChange 是否已部分挂上？bindingsMap 是否部分创建？
    // 预期：不会残留任何半成品
}
```

**验收标准**：
- ✅ build 中途 throw 时，TargetViewAdapter 已注册的 onChange 已清理
- ✅ bindingsMap 部分创建时，已创建的 bindings 已 destroy
- ✅ 不会残留 UI 事件监听或 watcher

---

**CREATIVE 模式完成时间**: 2025-01-XX  
**设计状态**: ✅ **COMPLETE**（方案 2.1 真·最终版）  
**推荐方案**: 方案 2.1 - 延迟构建方案（ViewTarget + TargetViewAdapter）  
**下一步**: 进入 BUILD 模式
