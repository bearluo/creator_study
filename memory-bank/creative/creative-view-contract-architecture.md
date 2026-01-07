# 创意设计文档 - View Contract 架构设计

## 🎨🎨🎨 ENTERING CREATIVE PHASE: ARCHITECTURE DESIGN

**任务ID**: MVVM-CREATOR-007  
**设计组件**: ViewHost 基类、View 基类、Contract 接口设计  
**创建时间**: 2025-01-XX

---

## 📋 需求与约束

### 核心需求

1. **ViewHost 基类**：
   - Cocos Creator Component 基类
   - 管理 ViewModel 和 View 的生命周期
   - 提供抽象方法供子类实现
   - 支持泛型（ViewModel 类型和 View Contract 类型）

2. **View 基类**（可选）：
   - 实现 View Contract 的基础结构
   - 提供 destroy 等通用方法
   - 不依赖 Cocos

3. **Contract 接口设计**：
   - 强类型契约
   - 只包含 ViewTarget 字段
   - 支持必需字段和可选字段

### 约束条件

1. **框架分离**：ViewModel 不依赖 Cocos
2. **类型安全**：完整的 TypeScript 类型支持
3. **生命周期管理**：正确处理 onEnable/onDisable/onDestroy
4. **幂等保证**：bindView 只能调用一次或支持重复调用
5. **职责清晰**：ViewHost 负责注入，VM 负责绑定

---

## 🎨 设计选项

### 选项 1：ViewHost 泛型设计（推荐）

**设计思路**：
- ViewHost 使用两个泛型参数：`ViewHost<TData, TContract>`
- TData：ViewModel 的数据类型
- TContract：View Contract 接口类型
- View 作为 Contract 的实现，由子类创建

**代码结构**：
```typescript
export abstract class ViewHost<TData, TContract> extends Component {
    protected viewModel!: ViewModel<TData>;
    protected view!: TContract;
    
    protected abstract createViewModel(): ViewModel<TData>;
    protected abstract createView(): TContract;
    protected abstract setupViewTargets(view: TContract): void;
    
    override onLoad(): void {
        this.viewModel = this.createViewModel();
        this.view = this.createView();
    }
    
    override onEnable(): void {
        this.setupViewTargets(this.view);
        // 调用 VM 的 bindView
        if (this.viewModel.bindView) {
            this.viewModel.bindView(this.view);
        }
    }
    
    override onDisable(): void {
        if (this.viewModel.dispose) {
            this.viewModel.dispose();
        }
    }
    
    override onDestroy(): void {
        this.onDisable();
        // 清理资源
    }
}
```

**优点**：
- ✅ 类型安全，Contract 类型明确
- ✅ 职责清晰，抽象方法明确
- ✅ 生命周期管理统一
- ✅ 易于扩展

**缺点**：
- ⚠️ 泛型参数较多（2个）
- ⚠️ 需要子类实现多个抽象方法

---

### 选项 2：ViewHost 简化设计（单泛型）

**设计思路**：
- ViewHost 只使用一个泛型参数：`ViewHost<TData>`
- Contract 类型通过 View 实例推断
- 更简单的 API

**代码结构**：
```typescript
export abstract class ViewHost<TData> extends Component {
    protected viewModel!: ViewModel<TData>;
    protected view!: any; // Contract 类型通过子类确定
    
    protected abstract createViewModel(): ViewModel<TData>;
    protected abstract createView(): any;
    protected abstract setupViewTargets(view: any): void;
    protected abstract bindView(viewModel: ViewModel<TData>, view: any): void;
    
    override onLoad(): void {
        this.viewModel = this.createViewModel();
        this.view = this.createView();
    }
    
    override onEnable(): void {
        this.setupViewTargets(this.view);
        this.bindView(this.viewModel, this.view);
    }
    
    override onDisable(): void {
        if (this.viewModel.dispose) {
            this.viewModel.dispose();
        }
    }
}
```

**优点**：
- ✅ API 更简单
- ✅ 泛型参数少

**缺点**：
- ❌ 类型安全性降低（view 是 any）
- ❌ 需要子类实现 bindView（职责不清）

---

### 选项 3：ViewHost 混合设计（推荐变体）

**设计思路**：
- ViewHost 使用两个泛型参数，但提供更灵活的抽象方法
- 支持两种模式：
  - 模式 A：VM 有 `bindView` 方法（推荐）
  - 模式 B：ViewHost 子类实现 `bindView`（兼容）

**代码结构**：
```typescript
export abstract class ViewHost<TData, TContract> extends Component {
    protected viewModel!: ViewModel<TData>;
    protected view!: TContract;
    
    protected abstract createViewModel(): ViewModel<TData>;
    protected abstract createView(): TContract;
    protected abstract setupViewTargets(view: TContract): void;
    
    /**
     * 可选的绑定方法（如果 VM 没有 bindView，子类可以重写）
     */
    protected bindView(viewModel: ViewModel<TData>, view: TContract): void {
        // 默认：尝试调用 VM 的 bindView 方法
        if ('bindView' in viewModel && typeof viewModel.bindView === 'function') {
            (viewModel as any).bindView(view);
        } else {
            // 如果 VM 没有 bindView，抛出错误提示子类实现
            throw new Error('ViewModel must implement bindView method, or override bindView in ViewHost');
        }
    }
    
    override onLoad(): void {
        this.viewModel = this.createViewModel();
        this.view = this.createView();
    }
    
    override onEnable(): void {
        this.setupViewTargets(this.view);
        this.bindView(this.viewModel, this.view);
    }
    
    override onDisable(): void {
        if (this.viewModel.dispose) {
            this.viewModel.dispose();
        }
    }
    
    override onDestroy(): void {
        this.onDisable();
    }
}
```

**优点**：
- ✅ 类型安全
- ✅ 灵活性高，支持两种模式
- ✅ 默认行为合理（调用 VM 的 bindView）
- ✅ 子类可以重写 bindView（兼容性）

**缺点**：
- ⚠️ 需要类型断言（`as any`）
- ⚠️ 运行时检查（`'bindView' in viewModel`）

---

### 选项 4：View 基类设计

**设计思路**：
- 提供可选的 View 基类
- 实现基础的 destroy 方法
- 提供类型辅助

**代码结构**：
```typescript
/**
 * View 基类（可选）
 * 
 * 如果 View 只需要持有 ViewTarget，可以直接实现接口
 * 如果需要通用功能，可以继承此类
 */
export class View implements IDestroyable {
    destroy(): void {
        // 默认实现：空
        // 子类可以重写
    }
}

/**
 * 使用示例：
 * 
 * export class HUDView extends View implements IHUDView {
 *     nameText!: ViewTarget<string>;
 *     levelText!: ViewTarget<string>;
 *     // ...
 * }
 */
```

**优点**：
- ✅ 提供通用功能（destroy）
- ✅ 可选使用，不强制

**缺点**：
- ⚠️ 可能过度设计（如果 View 只需要实现接口）

---

## 📊 方案对比

| 特性 | 选项 1（双泛型） | 选项 2（单泛型） | 选项 3（混合） | 选项 4（View基类） |
|------|-----------------|-----------------|---------------|-------------------|
| 类型安全 | ✅ 高 | ❌ 低 | ✅ 高 | ✅ 高 |
| API 简洁性 | ⚠️ 中等 | ✅ 高 | ⚠️ 中等 | ✅ 高 |
| 灵活性 | ✅ 高 | ⚠️ 中等 | ✅ 很高 | ✅ 高 |
| 职责清晰 | ✅ 高 | ❌ 低 | ✅ 高 | ✅ 高 |
| 扩展性 | ✅ 高 | ⚠️ 中等 | ✅ 高 | ✅ 高 |

---

## ✅ 推荐方案

### ViewHost：选项 3（混合设计）

**理由**：
1. **类型安全**：双泛型参数确保 Contract 类型明确
2. **灵活性**：支持两种模式（VM bindView 或子类重写）
3. **默认行为合理**：默认调用 VM 的 bindView，符合方案 C 的设计
4. **兼容性**：子类可以重写 bindView，支持特殊情况

**实现要点**：
- 使用 `'bindView' in viewModel` 运行时检查
- 提供清晰的错误提示
- 支持子类重写 bindView

### View：选项 4（可选基类）

**理由**：
1. **可选使用**：不强制继承，可以直接实现接口
2. **提供通用功能**：destroy 等通用方法
3. **类型辅助**：提供类型定义

**实现要点**：
- View 基类可选，不强制使用
- 如果 View 只需要实现接口，可以直接实现
- 如果需要通用功能，可以继承 View 基类

---

## 📝 实施指南

### ViewHost 实现

```typescript
/**
 * ViewHost - Cocos Creator Component 基类
 * 
 * @template TData ViewModel 的数据类型
 * @template TContract View Contract 接口类型
 */
export abstract class ViewHost<TData, TContract> extends Component {
    protected viewModel!: ViewModel<TData>;
    protected view!: TContract;
    
    /**
     * 创建 ViewModel
     */
    protected abstract createViewModel(): ViewModel<TData>;
    
    /**
     * 创建 View 实例
     */
    protected abstract createView(): TContract;
    
    /**
     * 设置 ViewTarget（控件 → ViewTarget 转换和注入）
     */
    protected abstract setupViewTargets(view: TContract): void;
    
    /**
     * 绑定 View（默认调用 VM 的 bindView）
     * 
     * 子类可以重写此方法以支持特殊情况
     */
    protected bindView(viewModel: ViewModel<TData>, view: TContract): void {
        if ('bindView' in viewModel && typeof viewModel.bindView === 'function') {
            (viewModel as any).bindView(view);
        } else {
            throw new Error(
                'ViewModel must implement bindView method, ' +
                'or override bindView in ViewHost'
            );
        }
    }
    
    override onLoad(): void {
        this.viewModel = this.createViewModel();
        this.view = this.createView();
    }
    
    override onEnable(): void {
        this.setupViewTargets(this.view);
        this.bindView(this.viewModel, this.view);
    }
    
    override onDisable(): void {
        if (this.viewModel.dispose) {
            this.viewModel.dispose();
        }
    }
    
    override onDestroy(): void {
        this.onDisable();
        // 清理引用
        (this as any).viewModel = undefined;
        (this as any).view = undefined;
    }
}
```

### View 基类实现（可选）

```typescript
/**
 * View 基类（可选）
 * 
 * 如果 View 只需要持有 ViewTarget，可以直接实现接口
 * 如果需要通用功能，可以继承此类
 */
export class View {
    /**
     * 销毁 View
     * 
     * 子类可以重写此方法以清理资源
     */
    destroy(): void {
        // 默认实现：空
    }
}
```

### 使用示例

```typescript
// 1. 定义 Contract
export interface IHUDView {
    nameText: ViewTarget<string>;
    levelText: ViewTarget<string>;
    hpBar: ViewTarget<number>;
    nameInput?: TwoWayViewTarget<string>;
}

// 2. 实现 View（可选继承 View 基类）
export class HUDView extends View implements IHUDView {
    nameText!: ViewTarget<string>;
    levelText!: ViewTarget<string>;
    hpBar!: ViewTarget<number>;
    nameInput?: TwoWayViewTarget<string>;
}

// 3. 实现 ViewHost
@ccclass('HUDViewHost')
export class HUDViewHost extends ViewHost<PlayerData, IHUDView> {
    @property(Label)
    nameLabel!: Label;
    
    @property(Label)
    levelLabel!: Label;
    
    @property(ProgressBar)
    hpProgressBar!: ProgressBar;
    
    @property(EditBox)
    nameEditBox?: EditBox;
    
    protected createViewModel(): ViewModel<PlayerData> {
        const model = new PlayerModel();
        return new HUDViewModel(model);
    }
    
    protected createView(): IHUDView {
        return new HUDView();
    }
    
    protected setupViewTargets(view: IHUDView): void {
        view.nameText = toLabelText(this.nameLabel);
        view.levelText = toLabelText(this.levelLabel);
        view.hpBar = toProgress(this.hpProgressBar);
        if (this.nameEditBox) {
            view.nameInput = toEditBox(this.nameEditBox);
        }
    }
}
```

---

## ✅ 验证

### 需求满足度

- ✅ **类型安全**：双泛型参数确保类型安全
- ✅ **框架分离**：ViewModel 不依赖 Cocos
- ✅ **生命周期管理**：正确处理 onEnable/onDisable/onDestroy
- ✅ **幂等保证**：由 VM 的 bindView 实现（已在计划中明确）
- ✅ **职责清晰**：ViewHost 负责注入，VM 负责绑定

### 设计质量

- ✅ **可扩展性**：支持子类重写 bindView
- ✅ **易用性**：默认行为合理，API 清晰
- ✅ **兼容性**：支持两种模式（VM bindView 或子类重写）

---

## 🎨🎨🎨 EXITING CREATIVE PHASE

**设计决策**：
- ViewHost：采用选项 3（混合设计）- 双泛型 + 灵活的 bindView
- View：采用选项 4（可选基类）- 提供通用功能，但不强制使用

**下一步**：进入 BUILD 模式开始实施

