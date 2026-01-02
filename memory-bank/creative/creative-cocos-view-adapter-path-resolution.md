# 🎨 CREATIVE: CocosViewAdapter 路径解析机制设计（实施方案）

## 任务信息
- **任务ID**: MVVM-CREATOR-005-CREATIVE-1
- **方案**: 3.2 - 统一路径格式方案（最终版）
- **状态**: ✅ COMPLETE

---

## 🔒 跨模块硬性共识（不能破）

以下规则是跨模块的硬性约束，所有实现必须遵守：

1. **path 永远是数据路径**
   - `CocosViewAdapter.update(path, value)` 的 path 就是数据 path
   - mappings 的 key 是 dataPath（如 'stats.health'）
   - 不能把 viewPath 当 key，否则会导致映射冲突

2. **View 不解析 path**
   - CocosViewAdapter 只做映射，不解析路径
   - 所有路径解析必须在 BindingBuilder 阶段完成
   - Adapter 的 update/get 是 O(1) 的 Map 查找

3. **Builder 做一次性重活**
   - BindingBuilder 在 build() 时解析所有 nodePath + getComponent
   - 解析结果缓存（key: rootNodeUUID + ':' + nodePath）
   - build 时一次性 resolve 完成，mapping 存的是最终 Node/Component 引用

4. **Adapter 永远 O(1)**
   - CocosViewAdapter 的 update/get 直接通过 Map<dataPath, mapping> 查找
   - 无需解析路径，无需遍历节点树
   - 性能关键：所有重活都在 Builder 阶段完成

5. **绑定清理必须落到 DataBinding.destroy()**
   - `DataBinding.destroy()` 是清理的核心点
   - 确保 reactive.watch 和 view.on 订阅都被清理
   - MVVMComponent 在 onDisable/onDestroy 调用 `binding.destroy()` 逐个释放
   - 否则会出现：组件销毁了，但 watcher 仍挂在 Reactive 上（内存泄露 + 访问已销毁组件）

---

## 📋 类型定义（方案 3.2 最终版）

```typescript
import * as cc from 'cc';

/**
 * Component 构造函数类型（Creator 习惯的 Component 构造签名）
 */
type ComponentCtor<T extends cc.Component = cc.Component> = new (...args: any[]) => T;

/**
 * 基础映射接口
 */
interface BaseMapping {
    target: cc.Node | cc.Component;
    /** 如果 target 是 Node 且要取组件时才需要；Node 字段（如 active）不需要 ctor */
    componentCtor?: ComponentCtor;
    /** 从 resolveRoot() 返回的 root（Node 或 Component）开始走的路径，比如 ['string'] / ['color'] / ['progress'] / ['active'] */
    memberPath: string[];  // 必填，>=1；从 root 对象开始走
    /** 可选清理钩子（不销毁节点，只解绑） */
    dispose?: () => void;
}

/**
 * 显示映射（只读，不需要输入监听）
 */
interface DisplayMapping extends BaseMapping {
    kind: 'display';
}

/**
 * 输入映射（需要监听输入事件）
 */
interface InputMapping extends BaseMapping {
    kind: 'input';
    /** 建立输入监听，返回 unsubscriber */
    bindInput(adapter: CocosViewAdapter, dataPath: string): () => void;
    /** 静默保护：用计数器更稳（内部使用） */
    _silentDepth?: number;
}

/**
 * 视图映射类型（显示或输入）
 */
type ViewMapping = DisplayMapping | InputMapping;
```

---

## 🔧 实施指南

### 步骤 1: 定义类型（方案 3.2 最终版）

使用上面的类型定义。

**重要说明**：
- `memberPath` 必填，>=1
- `componentCtor` 只有 target 为 Node 且你要访问组件字段时才需要
- Node 字段（如 active）不需要 ctor
- 运行时用 `cc.Component` / `cc.Node` 判断（`import type` 会被擦除）

### 步骤 2: 实现 CocosViewAdapter（方案 3.2 最终版）

```typescript
// adapters/CocosViewAdapter.ts
import * as cc from 'cc';

export class CocosViewAdapter implements IView {
    private mappings = new Map<string, ViewMapping>();
    private changeListeners = new Set<(path: string, value: any) => void>();
    private inputUnsubs: Array<() => void> = [];
    
    constructor(config: { rootNode: cc.Node; componentInstance?: any }) {
        // rootNode 和 componentInstance 可以存储，但主要用于 BindingBuilder 解析
        // Adapter 本身只负责映射管理
    }
    
    addMapping(dataPath: string, mapping: ViewMapping): void {
        // 检测重复映射
        if (this.mappings.has(dataPath)) {
            throw new Error(`[CocosViewAdapter] Duplicate mapping for dataPath: ${dataPath}`);
        }
        
        // 验证 memberPath 至少 1 段
        if (!mapping.memberPath || mapping.memberPath.length === 0) {
            throw new Error(`[CocosViewAdapter] memberPath must have at least 1 segment`);
        }
        
        this.mappings.set(dataPath, mapping);
        
        // 如果 mapping 带 input 监听能力，在这里注册（或由 Builder 统一注册）
        if (mapping.kind === 'input') {
            const un = mapping.bindInput(this, dataPath);
            if (typeof un === 'function') {
                this.inputUnsubs.push(un);
            }
        }
    }
    
    update(path: string, value: any): void {
        // 只更新视图，不 emit change
        const mapping = this.mappings.get(path);
        if (!mapping) {
            console.warn(`[CocosViewAdapter] No mapping for path: ${path}`);
            return;
        }
        this._setByMapping(path, mapping, value);  // 传入 dataPath 用于错误提示
    }
    
    get(path: string): any {
        const mapping = this.mappings.get(path);
        if (!mapping) {
            return undefined;
        }
        return this._getByMapping(mapping);
    }
    
    set(path: string, value: any): void {
        // 更新视图并 emit change（用于模拟用户输入）
        this.update(path, value);
        this._emitChange(path, value);
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        // 'change'：正常注册
        // 其他 event：console.warn + 返回空 unsubscriber（不 throw）
        if (event === 'change') {
            const fn = callback as (path: string, value: any) => void;
            this.changeListeners.add(fn);
            return () => {
                this.changeListeners.delete(fn);
            };
        }
        
        // 其他 event：console.warn + 返回空 unsubscriber（不 throw，避免把问题放大）
        console.warn(`[CocosViewAdapter] Unsupported event "${event}"`);
        return () => {};
    }
    
    destroy(): void {
        // 1. 解绑输入事件
        for (const un of this.inputUnsubs) {
            un();
        }
        this.inputUnsubs.length = 0;
        
        // 2. 清理 mapping 内资源（可选清理钩子）
        for (const mapping of this.mappings.values()) {
            mapping.dispose?.();  // dispose 只允许解绑事件/释放引用，不得 destroy Node/Component
        }
        
        // 3. 清空映射和监听器
        this.mappings.clear();
        this.changeListeners.clear();
    }
    
    /**
     * 触发 change 事件（给 InputMapping 用）
     * 
     * @param path 数据路径
     * @param value 值
     */
    emitChange(path: string, value: any): void {
        this._emitChange(path, value);
    }
    
    /**
     * 解析根对象（Node 或 Component）
     * 
     * 支持三类 root：
     * - target is Component → root=component
     * - target is Node + componentCtor → root=node.getComponent(ctor)
     * - target is Node + no ctor → root=node（Node.active/position/...）
     */
    private _resolveRoot(mapping: ViewMapping): cc.Node | cc.Component | null {
        const t = mapping.target;
        // 运行时用 cc.Component / cc.Node 判断（import type 会被擦除）
        if (t instanceof cc.Component) {
            return t;
        }
        
        // t is Node
        if (mapping.componentCtor) {
            return t.getComponent(mapping.componentCtor);
        }
        
        // 允许 Node 直接作为 root（Node.active 等）
        return t;
    }
    
    /**
     * 走到父对象（用于 set）
     * 
     * @returns { parent: any; key: string } | null
     * 
     * ⚠️ **硬性约束**：memberPath 只用于访问已存在字段，不做 auto-create
     * - 如果中间层为空，直接 warn 并返回 null
     * - UI 侧字段路径必须存在（比如 Label.string 永远存在）
     * - 不允许自动创建中间对象
     */
    private _walkToParent(root: any, path: string[]): { parent: any; key: string } | null {
        let obj = root;
        for (let i = 0; i < path.length - 1; i++) {
            obj = obj?.[path[i]];
            if (obj == null) {
                return null;  // 0/false/'' 不会触发 == null，OK
            }
        }
        return { parent: obj, key: path[path.length - 1] };
    }
    
    /**
     * 根据映射设置值（核心逻辑 - 方案 3.2 真·最终版）
     * 
     * 逻辑：
     * 1. resolveRoot：拿到 root 对象（Node 或 Component）
     * 2. walkToParent：走到父对象
     * 3. 如果是 InputMapping，在写入时 silentDepth 包起来（计数器 + try/finally）
     * 
     * @param dataPath 数据路径（用于错误提示）
     * @param mapping 视图映射
     * @param value 值
     */
    private _setByMapping(dataPath: string, mapping: ViewMapping, value: any): void {
        // 1. resolveRoot：拿到 root 对象
        const root = this._resolveRoot(mapping);
        if (!root) {
            console.warn(`[CocosViewAdapter] Cannot resolve root for "${dataPath}"`, mapping);
            return;
        }
        
        // 2. walkToParent：走到父对象
        const info = this._walkToParent(root, mapping.memberPath);
        if (!info) {
            console.warn(`[CocosViewAdapter] Cannot access path ${mapping.memberPath.join('.')} for "${dataPath}"`);
            return;
        }
        
        // 3. 如果是 InputMapping，在写入时 silentDepth 包起来（防止程序 set 引发输入事件回环）
        if (mapping.kind === 'input') {
            mapping._silentDepth = (mapping._silentDepth ?? 0) + 1;
        }
        
        try {
            info.parent[info.key] = value;
        } finally {
            // 使用 try/finally 保证恢复，即使异常也能恢复
            if (mapping.kind === 'input') {
                mapping._silentDepth = (mapping._silentDepth ?? 1) - 1;
            }
        }
    }
    
    /**
     * 根据映射获取值（核心逻辑 - 方案 3.2 真·最终版）
     * 
     * 逻辑：
     * 1. resolveRoot：拿到 root 对象
     * 2. walk memberPath：最后一段 get
     */
    private _getByMapping(mapping: ViewMapping): any {
        // 1. resolveRoot：拿到 root 对象
        const root = this._resolveRoot(mapping);
        if (!root) {
            return undefined;
        }
        
        // 2. walk memberPath：最后一段 get
        let obj: any = root;
        for (const key of mapping.memberPath) {
            obj = obj?.[key];
            if (obj == null) {
                return undefined;  // 0/false/'' 不会触发 == null，OK
            }
        }
        
        return obj;
    }
    
    /**
     * 触发 change 事件（内部方法）
     */
    private _emitChange(path: string, value: any): void {
        for (const callback of this.changeListeners) {
            callback(path, value);
        }
    }
}
```

### 步骤 3: 在 BindingBuilder 中创建映射（带缓存）

```typescript
// builders/BindingBuilder.ts
import * as cc from 'cc';

export class BindingBuilder<T> {
    private nodeCache = new Map<string, cc.Node>();  // 缓存节点路径解析结果（key: rootNodeUUID + ':' + nodePath）
    
    build(): { bindings: DataBinding<T, any, any>[]; view: TargetViewAdapter } {
        // 1. 解析 target（使用缓存）
        // 2. 决定 target 是 Node 还是 Component
        // 3. 决定是否需要 componentCtor
        // 4. 填 memberPath（例如 ['active'] / ['string']）
        
        // 创建视图映射
        if (item.isInput) {
            // 输入映射（带静默更新保护）
            const mapping: InputMapping = {
                kind: 'input',
                target,
                componentCtor: item.componentCtor,
                memberPath: item.memberPath,
                bindInput: (adapter, dataPath) => {
                    // 注册 Creator 事件（带静默保护）
                    const handler = () => {
                        // 使用计数器，如果 silentDepth > 0，不触发 change
                        // 建议只读 mapping，不要引用外部变量名（避免变量名错绑）
                        if ((mapping._silentDepth ?? 0) > 0) {
                            return;
                        }
                        adapter.emitChange(dataPath, this._getByMapping(mapping));
                    };
                    // 根据组件类型注册不同事件
                    this._registerInputEvent(target, handler);
                    return () => {
                        this._unregisterInputEvent(target, handler);
                    };
                }
            };
            this.viewAdapter.addMapping(item.path, mapping);
        } else {
            // 显示映射
            const mapping: DisplayMapping = {
                kind: 'display',
                target,
                componentCtor: item.componentCtor,
                memberPath: item.memberPath
            };
            this.viewAdapter.addMapping(item.path, mapping);
        }
        
        // 性能：允许 bindMany，但前置重复检测；否则用逐个 bind
        // 由于已经做了重复 path 检测，可以使用 bindMany 优化性能
        // ...
    }
    
    /**
     * 解析节点路径（带缓存）
     * 
     * 重点：
     * - 真正昂贵的是 NodePath 解析，必须放在 Builder
     * - 缓存 key：rootNodeUUID + ':' + nodePath
     * - 缓存命中要检查 isValid（Creator 节点销毁后引用会失效）
     * - nodePath 解析只在 build 阶段做一次（Adapter 永远 O(1)）
     * 
     * ⚠️ **跨 prefab/重建场景的有效性**：
     * - 缓存 key 使用 root.uuid，如果 root 重新实例化（新 uuid），旧缓存不会命中
     * - 这是预期行为：每个 prefab 实例有独立的缓存
     * - 避免误以为全局缓存：缓存是 per-instance 的，不是全局的
     */
    private resolveNodePath(root: cc.Node, path: string): cc.Node | null {
        const key = `${root.uuid}:${path}`;
        const hit = this.nodeCache.get(key);
        if (hit && hit.isValid) {
            return hit;  // 缓存命中且节点有效
        }
        
        // 走 children 查找（一次性）
        const found = this._findNodeByPath(root, path);
        if (found && found.isValid) {
            this.nodeCache.set(key, found);
        }
        return found;
    }
}
```

---

## 📋 使用示例

### 显示映射示例

```typescript
// 在 BindingBuilder 中创建显示映射
const displayMapping: DisplayMapping = {
    kind: 'display',
    target: this.nameLabel!,  // Component 对象
    memberPath: ['string']   // Label.string
};

this.viewAdapter.addMapping('name', displayMapping);
```

### 输入映射示例（带静默更新保护）

```typescript
// 在 BindingBuilder 中创建输入映射
const mapping: InputMapping = {
    kind: 'input',
    target: this.nameInput!,  // EditBox 组件
    memberPath: ['string'],
    bindInput: (adapter, dataPath) => {
        // ⚠️ **硬性实现约束**：bindInput 必须是工厂函数（接收 dataPath），不要直接捕获循环变量
        // 避免循环里创建 mapping，handler 引用循环变量导致错绑
        
        // 注册 EditBox 的 editing-did-ended 事件（减少高频触发）
        const handler = () => {
            // 静默更新保护：使用计数器，如果 silentDepth > 0，不触发 change
            // 建议只读 mapping，不要引用外部变量名（避免变量名错绑）
            if ((mapping._silentDepth ?? 0) > 0) {
                return;
            }
            adapter.emitChange(dataPath, this.nameInput!.string);
        };
        this.nameInput!.node.on(EditBox.EventType.EDITING_DID_ENDED, handler);
        
        // 返回取消监听函数
        return () => {
            this.nameInput!.node.off(EditBox.EventType.EDITING_DID_ENDED, handler);
        };
    }
};

this.viewAdapter.addMapping('playerName', mapping);
```

### 节点路径映射示例

```typescript
// 在 BindingBuilder 中解析节点路径（带缓存）
const node = this._resolveNodePath('child/grandchild');  // 使用缓存
const mapping: DisplayMapping = {
    kind: 'display',
    target: node,
    componentCtor: Label,  // 使用构造函数，类型安全
    memberPath: ['string']  // Label.string
};

this.viewAdapter.addMapping('childName', mapping);
```

### Node 字段示例（不需要 componentCtor）

```typescript
// Node.active（直接访问 Node 属性，不需要 componentCtor）
const mapping: DisplayMapping = {
    kind: 'display',
    target: this.deadMask!,  // Node
    // 不需要 componentCtor
    memberPath: ['active']  // Node.active
};

this.viewAdapter.addMapping('isDead', mapping);
```

---

## 📝 最终规范总结（方案 3.2）

### 实施要点（方案 3.2 真·最终版）

1. **Adapter 用 Map<dataPath, ViewMapping> 存映射**
   - mappings: `Map<string, ViewMapping>`
   - key 是 dataPath（数据路径），不是视图路径

2. **Builder 在 build 阶段 resolve nodePath + getComponent，并缓存结果（Adapter 永远 O(1)）**
   - 真正昂贵的是 NodePath 解析，必须放在 Builder
   - 缓存 key：`rootNodeUUID + ':' + nodePath`
   - 缓存命中要检查 `isValid`（Creator 节点销毁后引用会失效）

3. **mapping 字段固定：target / componentCtor? / memberPath / (input 的 bindInput) / _silentDepth? / dispose?**
   - 已彻底移除 property / componentType / accessPath 字段
   - memberPath 是从 resolveRoot() 返回的 root（Node 或 Component）开始走的路径

4. **update() 只写入不 emit；set() 才 emit（模拟用户输入）**
   - update(path, value)：只更新视图，不 emit change
   - set(path, value)：更新视图并 emit change（用于模拟用户输入）

5. **change 事件只来源于 InputMapping.bindInput -> adapter.emitChange(dataPath, value)**
   - 用户输入导致的 change 来自组件事件（EditBox/Toggle/Slider）
   - 程序更新 view 不应该 emit change（否则 two-way 死循环）

6. **destroy()：解绑 inputUnsubs + mapping.dispose? + clear maps/listeners**
   - dispose 只允许解绑事件/释放引用，不得 destroy Node/Component
   - 清理顺序：1. 解绑输入事件 2. 清理 mapping 内资源（可选清理钩子） 3. 清空映射和监听器

### 映射格式（最终规范 - 方案 3.2 真·最终版）

```typescript
import * as cc from 'cc';

/**
 * Component 构造函数类型（Creator 习惯的 Component 构造签名）
 */
type ComponentCtor<T extends cc.Component = cc.Component> = new (...args: any[]) => T;

interface BaseMapping {
    target: cc.Node | cc.Component;
    /** 如果 target 是 Node 且要取组件时才需要；Node 字段（如 active）不需要 ctor */
    componentCtor?: ComponentCtor;
    /** 从 resolveRoot() 返回的 root（Node 或 Component）开始走的路径，比如 ['string'] / ['color'] / ['progress'] / ['active'] */
    memberPath: string[];  // 必填，>=1；从 root 对象开始走
    /** 可选清理钩子（不销毁节点，只解绑） */
    dispose?: () => void;
}

interface DisplayMapping extends BaseMapping {
    kind: 'display';
}

interface InputMapping extends BaseMapping {
    kind: 'input';
    /** 建立输入监听，返回 unsubscriber */
    bindInput(adapter: CocosViewAdapter, dataPath: string): () => void;
    /** 静默保护：用计数器更稳（内部使用） */
    _silentDepth?: number;
}

type ViewMapping = DisplayMapping | InputMapping;
```

### 写入/读取逻辑（最终规范 - 方案 3.2 真·最终版）

**核心逻辑**：
1. **resolveRoot**：拿到 root 对象（Node 或 Component）
2. **walkToParent / walk memberPath**：最后一段 set / get
3. **如果是 InputMapping**：在写入时 silentDepth 包起来（计数器 + try/finally）

**关键点**：
- root 既可能是 Component，也可能是 Node
- set 时对 input mapping 增加 silentDepth
- set 用 try/finally 保证恢复，即使异常也能恢复

**示例**：
- `memberPath: ['string']` → `component.string = value` 或 `node.string = value`
- `memberPath: ['color']` → `component.color = value`
- `memberPath: ['progress']` → `component.progress = value`
- `memberPath: ['active']` → `node.active = value`（Node 直接访问，不需要 componentCtor）

### path 语义（最终规范）

**path 永远是数据路径，不是视图路径**：
- `CocosViewAdapter.update(path, value)` 的 path 就是数据 path
- mappings 的 key 是 dataPath（如 'stats.health'）
- 一定要明确：不能把 viewPath 当 key，否则会导致映射冲突

### IView.set()/change 规则（最终规范）

1. **update(path, value)**：只更新视图，不 emit change
   - 用于程序更新 view
   - 不会导致 two-way 死循环

2. **set(path, value)**：更新视图并 emit change
   - 只有你明确要"模拟用户输入"时才用（通常不需要）
   - 用于测试或特殊场景

3. **change 事件**：由 viewAdapter 挂具体 UI 事件触发
   - 用户输入导致的 change 来自组件事件（EditBox/Toggle/Slider）
   - 程序更新 view 不应该 emit change（否则 two-way 死循环）
   - 支持 unsubscribe

### 事件系统（最终规范）

- 使用 Set 实现 change 事件监听（主要支持 change 事件）
- change 事件由 InputMapping.bindInput() 触发
- 其他 event：不保证，默认 console.warn + 返回空 unsubscriber（不 throw）
- 事件清理在 destroy() 中完成（统一解绑所有输入监听 + 清理 mapping 内资源）
- dispose 只允许解绑事件/释放引用，不得 destroy Node/Component

### 性能优化（最终规范）

- **节点路径解析放在 Builder**：不在 Adapter 中解析
- **缓存解析结果**：BindingBuilder 对 'child/grandchild' 的 find 结果缓存（按 rootNode + path）
- **build 时一次性 resolve**：build 时一次性 resolve 完成，mapping 存的是最终 Node/Component 引用
- **Adapter 的 update 是 O(1)**：直接通过映射查找，无需解析

### 架构分工（最终规范）

**BindingBuilder 职责**：
- 收集绑定规则（链式 bind）
- 校验重复 path（build 时检测）
- 解析 nodePath + getComponent（一次性重活，带缓存）
- build 时创建 Adapter 映射 + DataBinding

**CocosViewAdapter 职责**：
- 统一事件总线（change 事件）
- dataPath → view target 映射（O(1) Map 查找）
- 不解析 path，只做映射
- update()：只写不 emit
- set()：写 + emit（仅模拟输入）

**MVVMComponent 职责**：
- 管生命周期（enable/build，disable/destroy）
- 统一管理 bindings 和 view 的销毁

**DataBinding 职责**：
- reactive.watch（依赖收集和更新）
- two-way 防回环（syncingToView / syncingToSource）

---

## ✅ 最终验收点（BUILD 前最后 check list）

1. **instanceof 使用 cc.Component/cc.Node（运行时存在）**
   - ✅ 使用 `import * as cc from 'cc'` 而不是 `import type`
   - ✅ 运行时用 `cc.Component` / `cc.Node` 判断

2. **destroy()：解绑 inputUnsubs + 可选 mapping.dispose + clear maps**
   - ✅ 解绑输入事件
   - ✅ 清理 mapping 内资源（可选清理钩子）
   - ✅ 清空映射和监听器

3. **warn/error 含 dataPath（可定位）**
   - ✅ `_setByMapping(dataPath, mapping, value)` 传入 dataPath
   - ✅ 错误提示包含 dataPath 和 mapping 信息

4. **实施指南已更新为 3.2 版本**（memberPath + ComponentCtor + _silentDepth + dispose）

5. **Builder：nodePath 解析 + 缓存只在 build 阶段做一次（Adapter 永远 O(1)）**
   - ✅ 真正昂贵的是 NodePath 解析，必须放在 Builder
   - ✅ 缓存 key：`rootNodeUUID + ':' + nodePath`
   - ✅ 缓存命中要检查 `isValid`

6. **ComponentCtor 定义收紧**
   - ✅ `type ComponentCtor<T extends cc.Component = cc.Component> = new (...args: any[]) => T;`
   - ✅ 避免传入非 Component ctor

7. **on(event)：不 throw，warn + 返回空 unsubscriber**
   - ✅ 'change'：正常注册
   - ✅ 其他 event：console.warn + 返回空 unsubscriber

8. **InputMapping handler：只读 mapping，不要引用外部变量名**
   - ✅ 使用 `mapping._silentDepth` 而不是外部变量名

9. **运行时类型判断必须用 cc.Component / cc.Node**
   - ✅ 运行时类型判断必须用 `cc.Component` / `cc.Node`（不能用 `import type` 的 Node/Component）
   - ✅ 防止以后被"优化 import"搞炸

---

## 🧪 BUILD 验收用例（能快速证明没坑）

### 用例 1: two-way 回环防护

**测试场景**：
```typescript
// 程序更新 EditBox.string
viewModel.set('playerName', 'New Name');
// 预期：不触发 change 事件

// 用户输入触发 change
editBox.string = 'User Input';
// 预期：触发 change 事件，写回 source

// 验证：不会死循环
```

**验收标准**：
- ✅ 程序更新 EditBox.string 不触发 change（silentDepth 保护）
- ✅ 用户输入触发 change（正常流程）
- ✅ 不会死循环（两层防护：ViewTarget + DataBinding）

### 用例 2: Node 字段映射

**测试场景**：
```typescript
const mapping: DisplayMapping = {
    kind: 'display',
    target: node,  // Node
    // 不需要 componentCtor
    memberPath: ['active']  // Node.active
};

adapter.addMapping('isDead', mapping);
adapter.update('isDead', true);
// 预期：node.active = true
```

**验收标准**：
- ✅ Node.active 映射不需要 componentCtor
- ✅ 正常工作（node.active 正确更新）

### 用例 3: 节点销毁后更新

**测试场景**：
```typescript
adapter.addMapping('name', mapping);
node.destroy();  // 节点被销毁

adapter.update('name', 'New Name');
// 预期：只 warn 不崩（或按标准决定是否 throw）
```

**验收标准**：
- ✅ update/get 只 warn 不崩（或按标准决定是否 throw）
- ✅ 不会访问已销毁节点导致崩溃

### 用例 4: memberPath 深层对象为空

**测试场景**：
```typescript
const mapping: DisplayMapping = {
    kind: 'display',
    target: component,
    memberPath: ['nonExistent', 'field']  // 中间层不存在
};

adapter.addMapping('path', mapping);
adapter.update('path', 'value');
// 预期：warn 并返回，不做 auto-create
```

**验收标准**：
- ✅ memberPath 只用于访问已存在字段，不做 auto-create
- ✅ 如果中间层为空，直接 warn 并返回 null

### 用例 5: InputMapping bindInput 闭包风险

**测试场景**：
```typescript
// 循环里创建 mapping（容易犯错）
for (let i = 0; i < 3; i++) {
    const mapping: InputMapping = {
        kind: 'input',
        target: inputs[i],
        memberPath: ['string'],
        bindInput: (adapter, dataPath) => {
            // ⚠️ 如果这里引用 i 或 inputs[i]，会导致错绑
            // 必须使用 dataPath 或 mapping 本身
            const handler = () => {
                if ((mapping._silentDepth ?? 0) > 0) return;
                adapter.emitChange(dataPath, inputs[i].string);  // ❌ 错误：引用循环变量
            };
            // ...
        }
    };
}
```

**验收标准**：
- ✅ bindInput 必须是工厂函数（接收 dataPath），不要直接捕获循环变量
- ✅ 避免循环里创建 mapping，handler 引用循环变量导致错绑

---

**CREATIVE 模式完成时间**: 2025-01-XX  
**设计状态**: ✅ **COMPLETE**（方案 3.2 真·最终版）  
**推荐方案**: 方案 3.2 - 统一路径格式方案（memberPath + 静默更新保护 + 类型精确 + Node 支持）  
**下一步**: 进入 BUILD 模式
