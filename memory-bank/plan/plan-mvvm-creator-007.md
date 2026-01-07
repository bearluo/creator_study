# 实施计划 - View Contract 强类型方案（方案 C）

## 任务信息

- **任务ID**: MVVM-CREATOR-007
- **任务名称**: mvvm-creator 实现 View Contract 强类型方案
- **复杂度**: Level 2 - Simple Enhancement
- **创建时间**: 2025-01-XX
- **预计时间**: 5-6 小时

---

## 📋 需求分析

### 核心需求

1. **设计 View Contract**：创建强类型契约，作为 VM 与 View 的接口
2. **层次分明**：清晰区分 Model、ViewModel、View Contract、ViewHost 四层
3. **框架分离**：ViewModel 不依赖 Cocos，只依赖 Contract（接口/类型）
4. **职责清晰**：绑定语义在 VM，控件细节在 ViewHost/View

### 功能需求

1. **View Contract（强类型契约）**：
   - 定义 ViewTarget 类型字段（不出现 Label/EditBox）
   - VM 只依赖 Contract，不依赖 Cocos
   - 提供类型安全的绑定接口

2. **View（实现 Contract）**：
   - 实现 Contract 接口
   - 只持有 ViewTarget（而不是具体 Label/EditBox）
   - 不 import cocos

3. **ViewHost（Cocos Component）**：
   - 负责：拿到具体控件 → 用 toLabelText/toProgress/toEditBox... 生成 ViewTarget → 注入到 View
   - 管理 Cocos Creator 组件引用
   - 管理组件生命周期

4. **ViewModel（绑定声明）**：
   - 在 `bindView(view: Contract)` 中声明绑定（path + converter + mode 等）
   - 不写 Label/ProgressBar，只写 path

### 非功能需求

1. **类型安全**：完整的 TypeScript 类型支持，字段写错编译失败
2. **公共性**：ViewModel 不 import cocos
3. **可复用**：同一个 VM 能绑定不同 View 皮肤（只要实现同 Contract）
4. **无泄漏**：切场景/销毁时 bindings 全释放

---

## 🏗️ 架构设计

### 设计原则

1. **Contract 强类型**：VM 与 View 通过 Contract 契约连接
2. **框架分离**：ViewModel 框架无关，不 import cocos
3. **职责清晰**：
   - VM：绑定语义（path + converter + mode）
   - View：实现 Contract，持有 ViewTarget
   - ViewHost：控件 → ViewTarget 转换和注入
4. **可复用**：同一 VM 可绑定不同 View 实现

### 架构图

```
PlayerModel (公共业务数据)
  ↓ @bl-framework/mvvm
HUDViewModel (公共 VM，不 import cocos)
  ↓ bindView(view: IHUDView)
IHUDView (View Contract，强类型契约)
  ↓ implements
HUDView (View 实现，只持有 ViewTarget)
  ↓ 注入 ViewTarget
HUDViewHost (Cocos Component，真正的 UI 脚本)
  ↓ 持有 Label/ProgressBar
Cocos Creator 控件
```

### 组件职责

**Model (PlayerModel)**：
- 公共业务数据
- 框架无关（在 @bl-framework/mvvm 中）

**ViewModel (HUDViewModel)**：
- 公共视图模型
- 框架无关（在 @bl-framework/mvvm 中，不 import cocos）
- 在 `bindView(view: Contract)` 中声明绑定
- 管理数据绑定（DataBinding）

**View Contract (IHUDView)**：
- 强类型契约（接口/类型）
- 只包含 ViewTarget 类型字段
- 不出现 Label/EditBox 等 Cocos 类型

**View (HUDView)**：
- 实现 Contract 接口
- 只持有 ViewTarget（而不是具体 Label/EditBox）
- 不 import cocos

**ViewHost (HUDViewHost)**：
- Cocos Creator 组件（在 @bl-framework/mvvm-creator 中）
- 真正的 UI 脚本
- 管理 Cocos Creator 组件引用（Label, EditBox 等）
- 负责：控件 → ViewTarget 转换和注入
- 管理组件生命周期

---

## 📝 详细设计

### 2.1 View Contract（强类型契约）

```typescript
/**
 * HUD View Contract
 * 
 * 只包含 ViewTarget 类型字段，不出现 Label/EditBox
 * 
 * ⚠️ **字段约定**：
 * - 必需字段：VM 一定会 bind（如 nameText, levelText, hpBar）
 * - 可选字段：VM 需判空再 bind（如 nameInput?）
 */
export interface IHUDView {
    // 必需字段：VM 一定会 bind
    nameText: ViewTarget<string>;
    levelText: ViewTarget<string>;
    hpBar: ViewTarget<number>;
    
    // 可选字段：VM 需判空再 bind
    nameInput?: TwoWayViewTarget<string>; // 如果支持双向
}
```

### 2.2 View（实现 Contract，但不碰 Cocos）

```typescript
/**
 * HUDView - 实现 View Contract
 * 
 * 只持有 ViewTarget，不 import cocos
 */
export class HUDView implements IHUDView {
    nameText!: ViewTarget<string>;
    levelText!: ViewTarget<string>;
    hpBar!: ViewTarget<number>;
    nameInput?: TwoWayViewTarget<string>;

    destroy(): void {
        // 可选：如果 ViewTarget 有 unsubscribe/destroy
        // 通常由 ViewHost 或 VM 统一管理
    }
}
```

### 2.3 ViewHost（Cocos Component，负责注入）

```typescript
/**
 * HUDViewHost - Cocos Creator 组件
 * 
 * 职责：
 * - 持有 Label/ProgressBar 等 Cocos 组件引用
 * - 将控件转换为 ViewTarget 并注入到 View
 * - 管理组件生命周期
 */
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

    protected setupViewTargets(view: HUDView): void {
        // 控件 → ViewTarget 转换和注入
        view.nameText = toLabelText(this.nameLabel);
        view.levelText = toLabelText(this.levelLabel);
        view.hpBar = toProgress(this.hpProgressBar);
        if (this.nameEditBox) {
            view.nameInput = toEditBox(this.nameEditBox);
        }
    }
}
```

### 2.4 ViewModel（绑定声明）

```typescript
/**
 * HUDViewModel - 公共 VM（不 import cocos）
 * 
 * 在 bindView 中声明绑定语义
 */
export class HUDViewModel extends ViewModel<PlayerData> {
    private isViewBound = false;
    
    /**
     * 绑定 View
     * 
     * ⚠️ **幂等保证**：
     * - bindView 只能被调用一次（推荐）
     * - 或者内部先 unbindAll() 再 bind（支持重复调用）
     * 
     * 建议：在 ViewHost 的 onEnable 中调用一次，onDisable 中调用 dispose()
     */
    bindView(view: IHUDView): void {
        // 方案 1：只允许调用一次（推荐）
        if (this.isViewBound) {
            console.warn('[HUDViewModel] bindView already called, ignoring');
            return;
        }
        
        // 方案 2：支持重复调用（先解绑再绑定）
        // this.unbindAll(); // 如果支持重复调用
        
        // 绑定语义在 VM，不写 Label/ProgressBar
        this.bind('name', view.nameText);
        this.bind('level', view.levelText, { 
            converter: (v: number) => `Lv.${v}` 
        });
        this.bind('health', view.hpBar, { 
            converter: (v: number) => v / this.reactive.value.maxHealth 
        });
        
        // 可选字段：需判空再 bind
        if (view.nameInput) {
            this.bind('name', view.nameInput, { mode: 'two-way' });
        }
        
        this.isViewBound = true;
    }
    
    /**
     * 解绑所有绑定
     */
    unbindAll(): void {
        // 使用 ViewModel 的 destroy() 或手动解绑
        this.destroy(); // 这会销毁所有 bindings
        this.isViewBound = false;
    }
    
    dispose(): void {
        // 统一销毁所有绑定
        this.unbindAll();
    }
}
```

---

## 🔧 实施步骤

### 阶段 1：基础骨架（1-1.5 小时）

**目标**：实现 ViewHost 和 View 基础类

**任务**：
1. 创建 `ViewHost.ts` 基类
   - 泛型：`ViewHost<TVm, TView>`
   - 生命周期管理（onLoad, onEnable, onDisable, onDestroy）
   - 抽象方法：`createViewModel()` 和 `setupViewTargets(view)`
2. 创建 `View.ts` 最小基类（可选）
   - 仅提供 destroy/挂载点即可

**文件**：
- `packages/mvvm-creator/src/components/ViewHost.ts`
- `packages/mvvm-creator/src/components/View.ts`（可选）

**关键点**：
- ViewHost 要保证 destroy 时释放绑定/订阅
- VM 负责释放也可以，但要有统一点

**验收**：
- ✅ ViewHost 能跑通生命周期（onLoad/onDestroy）
- ✅ View 仅提供 destroy/挂载点即可

---

### 阶段 2：Contract 范式落地（1 小时）

**目标**：定义和实现 View Contract

**任务**：
1. 定义 `IHUDView`（示例 Contract）
   - 字段全是 ViewTarget 类型
   - 不出现 Label/EditBox
   - **明确必需字段和可选字段的约定**：
     - 必需字段：VM 一定会 bind
     - 可选字段：VM 需判空再 bind（使用 `?` 标记）
2. 实现 `HUDView implements IHUDView`
   - 不 import cocos
   - 只持有 ViewTarget 字段

**文件位置策略**：
- **业务专用 Contract**（如 `IHUDView`）：👉 **强烈建议放在业务工程**
- **mvvm-creator 里**：👉 **只保留 ViewHost 基类 + 示例 Contract**（作为模板）
- 这样 mvvm-creator 不会变成"业务仓库"

**文件**：
- 业务层：`src/contracts/IHUDView.ts`（业务专用，放在业务工程）
- 业务层：`src/contracts/HUDView.ts`（业务专用，放在业务工程）
- mvvm-creator：`packages/mvvm-creator/src/contracts/ExampleViewContract.ts`（示例模板，可选）

**验收**：
- ✅ Contract 字段全是 ViewTarget 类型
- ✅ 明确必需字段和可选字段的约定
- ✅ View 实现不 import cocos
- ✅ 类型安全，字段写错编译失败
- ✅ 业务 Contract 放在业务工程，mvvm-creator 只保留示例

---

### 阶段 3：VM 侧绑定声明（1-1.5 小时）

**目标**：在 ViewModel 中实现 `bindView(view: Contract)`

**任务**：
1. 在 `HUDViewModel` 中实现 `bindView(view: IHUDView)`
   - VM 内完成全部 bind 语义
   - 只写 path，不写 Label/ProgressBar
   - **实现幂等保证**：
     - 方案 1：只允许调用一次（推荐，使用 `isViewBound` 标志）
     - 方案 2：支持重复调用（内部先 `unbindAll()` 再 bind）
2. 绑定生命周期管理（解绑）
   - VM 内 `dispose()` 或 `unbindAll()`
   - 切场景不泄漏
   - 在 ViewHost 的 `onEnable` 中调用 `bindView`，`onDisable` 中调用 `dispose()`

**文件**：
- 业务层：`HUDViewModel.ts`（示例）

**验收**：
- ✅ VM 只依赖 Contract，不知道 Label/Node
- ✅ VM 不 import cocos
- ✅ 绑定语义在 VM 中声明
- ✅ `bindView` 有幂等保证（只调用一次或支持重复调用）
- ✅ 切场景/销毁时 bindings 全释放

---

### 阶段 4：ViewHost 注入与组装（1-1.5 小时）

**目标**：在 ViewHost 中注入 ViewTarget 并触发 VM 绑定

**任务**：
1. 在 `HUDViewHost` 中注入 targets
   - `view.nameText = toLabelText(label)` 等
   - 控件 → ViewTarget 转换
2. 触发 VM 绑定
   - 在 `onEnable` 中调用 `vm.bindView(view)`
   - 在 `onDisable` 中调用 `vm.dispose()`（或 `unbindAll()`）
   - UI 能显示/更新

**文件**：
- 业务层：`HUDViewHost.ts`（示例）

**验收**：
- ✅ ViewHost 只做"控件→ViewTarget"，不写 path
- ✅ ViewHost 负责注入，VM 负责绑定
- ✅ 生命周期管理正确（onEnable 绑定，onDisable 解绑）
- ✅ UI 能显示/更新

---

### 阶段 5：测试与文档（1 小时）

**目标**：编写测试用例和文档

**任务**：
1. VM 单元测试（无需 Cocos）
   - 用 FakeViewTarget 验证绑定
   - 测试 `bindView` 方法
2. README 增加方案 C 示例
   - 完整的使用示例
   - 用户能照抄做第二个界面

**文件**：
- `packages/mvvm-creator/__tests__/contracts/HUDViewModel.test.ts`
- `packages/mvvm-creator/README.md`
- `packages/mvvm-creator/examples/view-contract-usage.ts`

**验收**：
- ✅ VM 单元测试通过（无需 Cocos）
- ✅ README 包含完整示例
- ✅ 用户能照抄做第二个界面

---

## 📁 文件结构

### 新增文件

```
packages/mvvm-creator/
├── src/
│   ├── components/
│   │   ├── View.ts                   # 新增（可选，最小基类）
│   │   └── ViewHost.ts              # 新增（Cocos Component 基类）
│   └── contracts/                   # 新增目录（示例模板，可选）
│       └── ExampleViewContract.ts   # 新增（示例 Contract 模板）
├── __tests__/
│   └── contracts/
│       └── ExampleViewModel.test.ts # 新增（VM 单元测试示例）
├── examples/
│   └── view-contract-usage.ts       # 新增（完整示例）
└── README.md                        # 更新

业务工程（示例）：
├── src/
│   └── contracts/                   # 业务专用 Contract
│       ├── IHUDView.ts              # 业务专用
│       ├── HUDView.ts               # 业务专用
│       ├── IShopView.ts             # 业务专用
│       └── ShopView.ts              # 业务专用
```

### 修改文件

- `packages/mvvm-creator/src/index.ts` - 导出 ViewHost（和可选的 contract 示例）
- `packages/mvvm-creator/README.md` - 增加"方案 C：Contract 绑定范式"

---

## ⚠️ 风险与对策（方案 C 特有）

### 风险 1：Contract 字段太多、维护成本上升

**对策**：
- Contract 只放"VM 真正需要绑定的目标"
- 不要把所有节点都写进去
- 按功能模块拆分 Contract（如 `IHUDView`, `IShopView`）

### 风险 2：ViewTarget 类型不统一

**对策**：
- 制定约束：
  - 文本统一用 `ViewTarget<string>`
  - 进度统一用 `ViewTarget<number>`
  - 输入框统一用 `TwoWayViewTarget<string>`（若支持双向）
- 在 Contract 中明确类型

### 风险 3：绑定销毁归属不清

**对策**：
- 规定：
  - VM 拥有 bindings → VM `dispose()` 统一销毁
  - ViewHost `onEnable` 调用 `vm.bindView(view)`
  - ViewHost `onDisable` 调用 `vm.dispose()`（或 `unbindAll()`）
  - ViewHost `onDestroy` 确保调用 `vm.dispose()`
- 在 ViewHost 基类中统一管理

### 风险 4：bindView 重复调用导致重复绑定

**对策**：
- **幂等保证**：
  - 方案 1（推荐）：`bindView` 只能被调用一次，使用 `isViewBound` 标志检查
  - 方案 2：`bindView` 内部先 `unbindAll()` 再 bind，支持重复调用
- 在文档中明确约定
- 在 ViewHost 基类中确保正确的调用时机（onEnable 绑定，onDisable 解绑）

### 风险 5：Contract 位置不明确

**对策**：
- **业务专用 Contract**（如 `IHUDView`, `IShopView`）：👉 **强烈建议放在业务工程**
- **mvvm-creator 里**：👉 **只保留 ViewHost 基类 + 示例 Contract**（作为模板）
- 这样 mvvm-creator 不会变成"业务仓库"
- 在文档中明确说明这个策略

### 风险 6：Contract 字段约定不明确

**对策**：
- **明确字段约定**：
  - 必需字段：VM 一定会 bind（不使用 `?`）
  - 可选字段：VM 需判空再 bind（使用 `?` 标记）
- 在 Contract 接口注释中明确说明
- 在 VM 的 `bindView` 中正确处理可选字段（判空再 bind）

---

## ✅ 验收标准（方案 C）

### 功能完整性

1. **公共性**：
   - ✅ `HUDViewModel.ts` 不 import cocos
   - ✅ VM 只依赖 Contract，不知道 Label/Node

2. **强类型**：
   - ✅ `bindView(view)` 有字段补全
   - ✅ 字段写错编译失败
   - ✅ 类型安全，路径类型自动推断

3. **职责清晰**：
   - ✅ ViewHost 不写 path
   - ✅ VM 不写 Label/ProgressBar
   - ✅ 绑定语义在 VM，控件细节在 ViewHost

4. **可复用**：
   - ✅ 同一个 VM 能绑定不同 HUD 皮肤（只要实现同 Contract）
   - ✅ Contract 作为接口，支持多实现

5. **无泄漏**：
   - ✅ 切场景/销毁时 bindings 全释放
   - ✅ ViewTarget 正确清理
   - ✅ `bindView` 有幂等保证，不会重复绑定

### 文档完整性

- ✅ README 包含方案 C 完整示例
- ✅ 包含 Contract 定义和使用说明
- ✅ 包含与 MVVMComponent 的区别说明

### 测试覆盖

- ✅ VM 单元测试（无需 Cocos）
- ✅ 使用 FakeViewTarget 验证绑定
- ✅ 测试绑定生命周期管理

---

## 📊 时间估算

| 阶段 | 任务 | 预计时间 |
|------|------|----------|
| 阶段 1 | 基础骨架（ViewHost + View） | 1-1.5 小时 |
| 阶段 2 | Contract 范式落地 | 1 小时 |
| 阶段 3 | VM 侧绑定声明 | 1-1.5 小时 |
| 阶段 4 | ViewHost 注入与组装 | 1-1.5 小时 |
| 阶段 5 | 测试与文档 | 1 小时 |
| **总计** | | **5-6 小时** |

---

## 🎯 下一步

1. **进入 BUILD 模式**：开始实施
2. **或进入 CREATIVE 模式**：如果需要进一步设计 Contract 接口

**建议**：由于设计相对明确，可以直接进入 BUILD 模式开始实施。

---

## 📝 备注

### 方案 C 核心要点

1. **Contract 强类型**：VM 与 View 通过 Contract 契约连接
2. **框架分离**：ViewModel 框架无关，不 import cocos
3. **职责清晰**：
   - VM：绑定语义（path + converter + mode）
   - View：实现 Contract，持有 ViewTarget
   - ViewHost：控件 → ViewTarget 转换和注入
4. **可复用**：同一 VM 可绑定不同 View 实现
5. **幂等保证**：`bindView` 只能被调用一次，或内部先 `unbindAll()` 再 bind

### Contract 位置建议

- **业务专用 Contract**（如 `IHUDView`, `IShopView`）：👉 **强烈建议放在业务工程**
  - 位置：`业务工程/src/contracts/IHUDView.ts`
  - 原因：避免 mvvm-creator 变成"业务仓库"
- **mvvm-creator 里**：👉 **只保留 ViewHost 基类 + 示例 Contract**（作为模板）
  - 位置：`mvvm-creator/src/contracts/ExampleViewContract.ts`（可选）
  - 用途：作为模板，供开发者参考

### Contract 字段约定

- **必需字段**：VM 一定会 bind（不使用 `?`）
  - 示例：`nameText: ViewTarget<string>`
  - VM 中直接 bind：`this.bind('name', view.nameText)`
- **可选字段**：VM 需判空再 bind（使用 `?` 标记）
  - 示例：`nameInput?: TwoWayViewTarget<string>`
  - VM 中判空再 bind：`if (view.nameInput) { this.bind('name', view.nameInput, { mode: 'two-way' }); }`

### 与 MVVMComponent 的区别

- **MVVMComponent**：一体化方案，Component 直接管理 ViewModel 和绑定
- **方案 C**：分离方案，VM 不依赖 Cocos，通过 Contract 连接
