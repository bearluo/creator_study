# 🎨 CREATIVE: MVVMComponent 生命周期管理设计（实施方案）

## 任务信息
- **任务ID**: MVVM-CREATOR-005-CREATIVE-3
- **方案**: 2 - 创建/绑定分离的生命周期管理（最终版）
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
   - 所有路径解析必须在 BindingBuilder 阶段完成
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

---

## 📋 核心设计（方案 2 最终版）

### 生命周期职责边界（最终规范）

**onLoad**：只做一次性的"结构准备"
- 缓存组件引用 / 找节点（最好都 @property）
- 创建 viewAdapter（如果它只是映射，不挂事件）
- 不做 watch、不做绑定订阅（避免禁用/启用导致重复）

**onEnable**：开始"激活绑定/订阅"
- 建立 reactive.watch（watcher 依赖收集）
- 注册 view change（two-way）
- 执行一次 run（初始渲染）

**onDisable**：暂停"绑定/订阅"（非常推荐）
- destroy/unwatch 所有 DataBinding（或统一暂停）
- 解绑 view change 监听
- Cocos 里节点 disable 可能频繁发生；不暂停会导致隐藏 UI 仍在跑 watcher.run，浪费且可能改到无效组件。

**onDestroy**：彻底释放
- 确保 onDisable 已做的事情都做过（幂等）
- 释放 adapter 映射、清空引用

**一句话**：
- onLoad 构建静态结构，onEnable 建立动态连接，onDisable 断开连接，onDestroy 释放资源。

### 标志语义（最终规范）

**isCreated**：VM/Adapter/Builder 是否创建完成（只一次）
- 表示 ViewModel、Adapter、Builder 是否已创建
- 在 onLoad 时设置为 true
- 在 onDestroy 时设置为 false

**isBound**：绑定/监听是否当前激活（可反复）
- 表示 bindings 和 view 是否当前激活
- 在 onEnable 时设置为 true
- 在 onDisable 时设置为 false
- 可以反复切换（enable/disable 场景）

### 绑定清理规范（最终规范）

**绑定清理必须落到 DataBinding.destroy()**：
- `DataBinding.destroy()` 是清理的核心点
- 确保 reactive.watch 和 view.on 订阅都被清理
- MVVMComponent 在 onDisable/onDestroy 调用 `binding.destroy()` 逐个释放
- 否则会出现：组件销毁了，但 watcher 仍挂在 Reactive 上（内存泄露 + 访问已销毁组件）

---

## 🔧 实施指南

### 步骤 1: 定义 MVVMComponent 基类

```typescript
// components/MVVMComponent.ts
import { Component } from 'cc';
import type { ViewModel } from '@bl-framework/mvvm';
import type { Model } from '@bl-framework/mvvm';
import type { BindingBuilder } from '../builders/BindingBuilder';
import type { DataBinding } from '@bl-framework/mvvm';
import type { TargetViewAdapter } from '../adapters/TargetViewAdapter';

export abstract class MVVMComponent<T = any> extends Component {
    protected viewModel!: ViewModel<T>;
    protected bindingBuilder!: BindingBuilder<T>;
    protected view?: TargetViewAdapter; // 现在 holds the shared adapter

    private isCreated = false;
    private isBound = false;

    private bindings: DataBinding<T, any, any>[] = []; // or Map

    override onLoad(): void {
        this._createIfNeeded(); // 只创建，不绑定
    }

    override onEnable(): void {
        this._createIfNeeded();
        this._bindIfNeeded();   // 建立订阅/事件
    }

    override onDisable(): void {
        this._unbindIfNeeded(); // 暂停订阅/事件（强烈建议）
    }

    override onDestroy(): void {
        this._unbindIfNeeded();
        this._destroyAll();
    }

    /**
     * 创建 MVVM 对象（只执行一次）
     */
    private _createIfNeeded(): void {
        if (this.isCreated) return;

        const model = this.createModel();
        this.viewModel = this.initViewModel(model);

        this.bindingBuilder = new BindingBuilder<T>(this.viewModel); // No viewAdapter passed here

        this.onMVVMCreate(); // 子类声明绑定规则/注册命令等（不做 build）
        this.isCreated = true;
    }

    /**
     * 建立绑定和订阅（可反复执行）
     * 
     * ⚠️ **风险控制**：build 失败时的半成品清理策略
     * - BindingBuilder.build() 内部已处理半成品清理（见 BindingBuilder 设计）
     * - 这里只需要确保 isBound 标志正确
     */
    private _bindIfNeeded(): void {
        if (this.isBound) return;

        try {
            // build returns bindings and the shared view adapter
            // ⚠️ 如果 build 中途 throw，BindingBuilder 会清理已创建的 bindings 和 view
            const { bindings, view } = this.bindingBuilder.build();
            this.bindings = bindings;
            this.view = view; // Store the shared adapter

            this.isBound = true;
        } catch (error) {
            console.error(`[MVVMComponent] Binding failed:`, error);
            // BindingBuilder 已清理半成品，这里只需要重置标志
            this.isBound = false;
            throw error;
        }
    }

    /**
     * 断开绑定和订阅（可反复执行，幂等）
     */
    private _unbindIfNeeded(): void {
        if (!this.isBound) return;

        // 销毁所有 DataBinding（解绑 reactive.watch）
        for (const binding of this.bindings) {
            binding.destroy();
        }
        this.bindings.length = 0;

        // 销毁 view（解绑 UI 事件）
        this.view?.destroy(); // Destroy the shared adapter (unbinds UI events)
        this.view = undefined;

        this.isBound = false;
    }

    /**
     * 彻底释放所有资源（只执行一次）
     */
    private _destroyAll(): void {
        if (!this.isCreated) return;

        // 确保绑定已清理（幂等）
        this._unbindIfNeeded();

        // 清空引用
        // @ts-ignore
        this.viewModel = undefined;
        // @ts-ignore
        this.bindingBuilder = undefined;

        this.isCreated = false;
    }

    // 抽象方法
    protected abstract createModel(): Model<T>;
    protected abstract initViewModel(model: Model<T>): ViewModel<T>;
    
    /**
     * 只做一次：声明绑定、准备命令、缓存组件引用等
     * 注意：这里不应该调用 build()，build() 由基类在 onEnable 时统一调用
     */
    protected abstract onMVVMCreate(): void;
}
```

### 步骤 2: 子类实现

```typescript
// components/PlayerComponent.ts
import { _decorator, Label, EditBox } from 'cc';
import { MVVMComponent } from './MVVMComponent';
import { toLabelText, toLabelFmt, toEditBox } from '../helpers/view-targets';

const { ccclass, property } = _decorator;

interface PlayerData {
    name: string;
    level: number;
    playerName: string;
}

@ccclass('PlayerComponent')
export class PlayerComponent extends MVVMComponent<PlayerData> {
    @property(Label)
    nameLabel!: Label;
    
    @property(Label)
    levelLabel!: Label;
    
    @property(EditBox)
    nameInput!: EditBox;

    protected createModel(): Model<PlayerData> {
        return {
            name: 'Player',
            level: 1,
            playerName: 'New Player'
        };
    }

    protected initViewModel(model: Model<PlayerData>): ViewModel<PlayerData> {
        return new ViewModel(model);
    }

    protected onMVVMCreate(): void {
        // 只声明绑定规则，不调用 build()
        this.bindingBuilder
            .bind('name', toLabelText(this.nameLabel!))
            .bind('level', toLabelFmt(this.levelLabel!, (v: number) => `Lv.${v}`))
            .bind('playerName', toEditBox(this.nameInput!), { mode: 'two-way' });
        // build() 会在基类的 onEnable() 中自动调用
    }
}
```

---

## 📋 使用示例

### 生命周期流程示例

```typescript
// 场景：组件被添加到场景
// 1. onLoad() 被调用
//    - _createIfNeeded() 执行
//    - 创建 model、viewModel、bindingBuilder
//    - 调用 onMVVMCreate()（子类声明绑定规则）
//    - isCreated = true
//    - 注意：此时还没有建立绑定

// 2. onEnable() 被调用
//    - _createIfNeeded() 检查（已创建，跳过）
//    - _bindIfNeeded() 执行
//    - bindingBuilder.build() 创建 bindings 和 view
//    - isBound = true
//    - 此时绑定已激活，数据开始流动

// 3. 用户禁用节点（node.active = false）
//    - onDisable() 被调用
//    - _unbindIfNeeded() 执行
//    - 所有 binding.destroy()（解绑 reactive.watch）
//    - view.destroy()（解绑 UI 事件）
//    - isBound = false
//    - 此时绑定已暂停，watcher 不再运行

// 4. 用户重新启用节点（node.active = true）
//    - onEnable() 被再次调用
//    - _bindIfNeeded() 执行
//    - 重新 build() 创建新的 bindings 和 view
//    - isBound = true
//    - 绑定重新激活

// 5. 组件被销毁
//    - onDestroy() 被调用
//    - _unbindIfNeeded() 执行（幂等，确保清理）
//    - _destroyAll() 执行
//    - 清空所有引用
//    - isCreated = false
```

---

## 📝 最终规范总结（方案 2）

### 生命周期职责边界（最终规范）

1. **onLoad**：只做一次性的"结构准备"
   - 缓存组件引用 / 找节点（最好都 @property）
   - 创建 viewAdapter（如果它只是映射，不挂事件）
   - 不做 watch、不做绑定订阅（避免禁用/启用导致重复）

2. **onEnable**：开始"激活绑定/订阅"
   - 建立 reactive.watch（watcher 依赖收集）
   - 注册 view change（two-way）
   - 执行一次 run（初始渲染）

3. **onDisable**：暂停"绑定/订阅"（非常推荐）
   - destroy/unwatch 所有 DataBinding（或统一暂停）
   - 解绑 view change 监听
   - Cocos 里节点 disable 可能频繁发生；不暂停会导致隐藏 UI 仍在跑 watcher.run，浪费且可能改到无效组件。

4. **onDestroy**：彻底释放
   - 确保 onDisable 已做的事情都做过（幂等）
   - 释放 adapter 映射、清空引用

**一句话**：
- onLoad 构建静态结构，onEnable 建立动态连接，onDisable 断开连接，onDestroy 释放资源。

### 标志语义（最终规范）

**isCreated**：VM/Adapter/Builder 是否创建完成（只一次）
- 表示 ViewModel、Adapter、Builder 是否已创建
- 在 onLoad 时设置为 true
- 在 onDestroy 时设置为 false

**isBound**：绑定/监听是否当前激活（可反复）
- 表示 bindings 和 view 是否当前激活
- 在 onEnable 时设置为 true
- 在 onDisable 时设置为 false
- 可以反复切换（enable/disable 场景）

### 绑定清理规范（最终规范）

**绑定清理必须落到 DataBinding.destroy()**：
- `DataBinding.destroy()` 是清理的核心点
- 确保 reactive.watch 和 view.on 订阅都被清理
- MVVMComponent 在 onDisable/onDestroy 调用 `binding.destroy()` 逐个释放
- 否则会出现：组件销毁了，但 watcher 仍挂在 Reactive 上（内存泄露 + 访问已销毁组件）

### Two-Way 死循环防护规范（最终规范）

**框架内置防护机制**：
- `DataBinding` 内 `syncingToView`（view.update 时屏蔽 view.change）
- `ViewTarget` 内 `silentDepth` 计数器 + `try/finally`（同步可证明）
- 两层防护：ViewTarget（同步） + DataBinding（异步）

**防护策略**：
- 同步回环：ViewTarget 的 `silentDepth` 计数器 + `try/finally` 严格保证
- 异步回环：DataBinding 的"来源标记/版本号/dirty guard"

**使用说明**：
- 子类无需关心死循环防护，框架已内置
- 只需要正确使用 `mode: 'two-way'` 和 `reverseConverter`

### 架构分工（最终规范）

**BindingBuilder 职责**：
- 收集绑定规则（链式 bind）
- 校验重复 path（build 时检测）
- 解析 nodePath + getComponent（一次性重活，带缓存）
- build 时创建 Adapter 映射 + DataBinding

**ViewAdapter（TargetViewAdapter / CocosViewAdapter）职责**：
- 统一事件总线（change 事件）
- dataPath → view target 映射（O(1) Map 查找）
- 不解析 path，只做映射

**MVVMComponent 职责**：
- 管生命周期（enable/build，disable/destroy）
- 统一管理 bindings 和 view 的销毁

**DataBinding 职责**：
- reactive.watch（依赖收集和更新）
- two-way 防回环（syncingToView / syncingToSource）

---

## ✅ 最终验收点（BUILD 前最后 check list）

1. **创建/绑定彻底分离**
   - ✅ isCreated：VM / Builder / Adapter（只一次）
   - ✅ isBound：bindings / view（可反复）

2. **生命周期职责边界**
   - ✅ onLoad：只创建对象
   - ✅ onEnable：build + 激活绑定
   - ✅ onDisable：binding.destroy() + view.destroy()
   - ✅ onDestroy：幂等清理

3. **绑定清理规范**
   - ✅ 绑定清理必须落到 DataBinding.destroy()
   - ✅ MVVMComponent 在 onDisable/onDestroy 调用 binding.destroy() 逐个释放

4. **子类实现规范**
   - ✅ 子类只实现 onMVVMCreate()，禁止手动 build
   - ✅ build() 由基类在 onEnable 时统一调用

5. **Two-Way 死循环防护**
   - ✅ 框架内置防护机制（DataBinding + ViewTarget）
   - ✅ 两层防护：ViewTarget（同步） + DataBinding（异步）

---

## 🧪 BUILD 验收用例（能快速证明没坑）

### 用例 1: disable/enable 循环

**测试场景**：
```typescript
// 循环 100 次 disable/enable
for (let i = 0; i < 100; i++) {
    component.onDisable();
    component.onEnable();
}

// 预期：watcher 数量不增长、输入事件不叠加
```

**验收标准**：
- ✅ watcher 数量不增长（每次 disable 都 destroy，enable 重新创建）
- ✅ 输入事件不叠加（每次 disable 都解绑，enable 重新注册）
- ✅ 内存不泄露（无残留订阅）

### 用例 2: 视图引用缓存一致性

**测试场景**：
```typescript
// onLoad 缓存组件引用
component.onLoad();  // 缓存 this.nameLabel

// 节点结构被替换（动态 instantiate/换皮肤）
// 预期：需要触发 recreate（isCreated=false 重新走 create）
```

**验收标准**：
- ✅ UI 结构不可热替换（硬性约束）
- ✅ 如需热替换，必须在替换后触发 recreate

---

**CREATIVE 模式完成时间**: 2025-01-XX  
**设计状态**: ✅ **COMPLETE**（方案 2 真·最终版）  
**推荐方案**: 方案 2 - 创建/绑定分离的生命周期管理  
**下一步**: 进入 BUILD 模式
