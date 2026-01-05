# @bl-framework/mvvm-creator

bl-framework MVVM 框架的 Cocos Creator 集成模块，提供完整的 Cocos Creator 组件和数据绑定支持。

## 安装

```bash
npm install @bl-framework/mvvm-creator @bl-framework/mvvm
```

**注意**: 本模块需要在 Cocos Creator 3.8+ 项目中使用。

## 快速开始

### 基础示例

```typescript
import { _decorator, Label, EditBox, ProgressBar, Node } from 'cc';
import { MVVMComponent } from '@bl-framework/mvvm-creator';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { toLabelText, toLabelText, toEditBox, toProgress, toActive } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

interface PlayerData {
    name: string;
    level: number;
    health: number;
    maxHealth: number;
    playerName: string;
    isDead: boolean;
}

@ccclass('PlayerMVVMComponent')
export class PlayerMVVMComponent extends MVVMComponent<PlayerData> {
    @property(Label)
    nameLabel!: Label;
    
    @property(Label)
    levelLabel!: Label;
    
    @property(Label)
    healthLabel!: Label;
    
    @property(ProgressBar)
    healthBar!: ProgressBar;
    
    @property(EditBox)
    nameInput!: EditBox;
    
    @property(Node)
    deadMask!: Node;

    protected createModel(): Model<PlayerData> {
        return new Model<PlayerData>({
            name: 'Player',
            level: 1,
            health: 100,
            maxHealth: 100,
            playerName: 'New Player',
            isDead: false
        });
    }

    protected initViewModel(model: Model<PlayerData>): ViewModel<PlayerData> {
        return new ViewModel(model);
    }

    protected onMVVMCreate(): void {
        // 方式 1: 使用 bind() 方法（原有方式，仍然支持）
        // this.bindingBuilder
        //     .bind('name', toLabelText(this.nameLabel))
        //     .bind('level', toLabelText(this.levelLabel), { converter: (v: number) => `Lv.${v}` })
        //     ...

        // 方式 2: 使用 bindConfig() 方法（新语法糖，推荐）
        this.bindingBuilder.bindConfig([
            { path: 'name', target: this.nameLabel, helper: 'toLabelText' },
            {
                path: 'level',
                target: this.levelLabel,
                helper: 'toLabelText',
                converter: (v) => `Lv.${v}` // ✅ v 自动推断为 number（不要手写类型）
            },
            {
                path: 'health',
                target: this.healthLabel,
                helper: 'toLabelText',
                converter: (v) => `${v}/${this.viewModel.reactive.value.maxHealth}`
            },
            {
                path: 'health',
                target: this.healthBar,
                helper: 'toProgress',
                converter: (v) => v / this.viewModel.reactive.value.maxHealth // 同 path，多个 display
            },
            {
                path: 'playerName',
                target: this.nameInput,
                helper: 'toEditBox',
                mode: 'two-way'
            },
            { path: 'isDead', target: this.deadMask, helper: 'toActive' }
        ] as const); // 使用 as const 保持字面量类型
    }
}
```

## 核心功能

### MVVMComponent

MVVM 组件基类，提供完整的生命周期管理。

**生命周期**：
- `onLoad()`: 创建 MVVM 对象（ViewModel、BindingBuilder）
- `onEnable()`: 建立绑定和订阅
- `onDisable()`: 断开绑定和订阅
- `onDestroy()`: 彻底释放资源

**抽象方法**：
- `createModel(): Model<T>` - 创建数据模型
- `initViewModel(model: Model<T>): ViewModel<T>` - 初始化 ViewModel
- `onMVVMCreate(): void` - 声明绑定规则（不调用 build()）

**属性**：
- `protected viewModel!: ViewModel<T>` - ViewModel 实例
- `protected bindingBuilder!: BindingBuilder<T>` - 绑定构建器
- `protected view?: TargetViewAdapter` - 共享的视图适配器

### BindingBuilder

类型安全的绑定构建器，提供流畅的链式 API。

```typescript
protected onMVVMCreate(): void {
    this.bindingBuilder
        .bind('name', toLabelText(this.nameLabel))
        .bind('level', toLabelText(this.levelLabel), { converter: (v: number) => `Lv.${v}` })
        .bind('playerName', toEditBox(this.nameInput), { mode: 'two-way' })
        // build() 由基类在 onEnable 时统一调用
}
```

**方法**：
- `bind<P extends Path<T> & string, TV>(path: P, target: ViewTarget<TV>, options?: BindingOptions<PathValue<T, P>, TV>): this` - 添加类型安全的数据绑定
- `bindConfig<const C extends readonly BindingConfigEntry<T, Path<T> & string>[]>(config: C): this` - 批量绑定配置（新语法糖，推荐）
- `build(): { bindings: DataBinding[], view: TargetViewAdapter }` - 构建所有绑定（只允许调用一次）
- `clear(): void` - 清空配置（用于 builder 复用）

**特性**：
- ✅ 类型安全：路径自动提示，编译时类型检查
- ✅ 支持同 path 多个 target（display/input 都可）
- ✅ 自动防回环：two-way 绑定使用 silentDepth 机制防止死循环
- ✅ 延迟构建：在 `onEnable` 时统一调用 `build()`
- ✅ 语法糖：`bindConfig()` 方法减少模板代码

#### bindConfig() 方法（推荐）

`bindConfig()` 提供更简洁的声明式绑定语法，减少模板代码：

```typescript
protected onMVVMCreate(): void {
    this.bindingBuilder.bindConfig([
        { path: 'name', target: this.nameLabel, helper: 'toLabelText' },
        {
            path: 'level',
            target: this.levelLabel,
            helper: 'toLabelText',
            converter: (v) => `Lv.${v}` // ✅ v 自动推断为 number（不要手写类型）
        },
        {
            path: 'health',
            target: this.healthBar,
            helper: 'toProgress',
            converter: (v) => v / this.viewModel.reactive.value.maxHealth
        },
        {
            path: 'playerName',
            target: this.nameInput,
            helper: 'toEditBox',
            mode: 'two-way'
        }
    ] as const); // 使用 as const 保持字面量类型
}
```

**优势**：
- ✅ 更简洁：数组式配置，减少重复代码
- ✅ 类型安全：`converter` 参数类型自动推断
- ✅ 支持同 path 多个 target：数组天然支持
- ✅ 向后兼容：`bind()` 方法仍然可用

**内置 Helper**：
- `toLabelText` - Label 文本绑定（字符串，可通过 `converter` 格式化）
- `toProgress` - ProgressBar 进度绑定（可选 `converter`，内部会 clamp 0..1）
- `toActive` - Node 激活状态绑定
- `toEditBox` - EditBox 输入绑定（支持 `two-way`，可选 `event`、`reverseConverter`）
- `toToggle` - Toggle 开关绑定（支持 `two-way`，可选 `reverseConverter`）
- `toSlider` - Slider 滑块绑定（支持 `two-way`，可选 `reverseConverter`）

**自定义 Helper**：
可以直接传递 `ViewTarget` 实例：

```typescript
this.bindingBuilder.bindConfig([
    {
        path: 'custom',
        viewTarget: myCustomViewTarget, // 直接传递 ViewTarget
        mode: 'two-way'
    }
] as const);
```

⚠️ **责任边界**：
- `viewTarget` 分支不做 null 校验（校验应在 helper 函数内完成）
- `mode` 的正确性由 `ViewTarget` 作者保证（框架不会检查 `ViewTarget` 是否支持 `two-way`）

### ViewTarget 辅助函数

提供类型安全的视图目标创建函数。

#### 显示型（Display）

**toLabelText** - Label 文本绑定（字符串）

```typescript
.bind('name', toLabelText(this.nameLabel))
```

**toLabelText** - Label 文本绑定（可通过 `converter` 格式化）

```typescript
.bind('level', toLabelText(this.levelLabel), { converter: (v: number) => `Lv.${v}` })
```

**toProgress** - ProgressBar 进度绑定

```typescript
.bind('health', toProgress(this.healthBar), { converter: (v: number) => v / maxHealth })
```

**toActive** - Node 激活状态绑定

```typescript
.bind('isDead', toActive(this.deadMask))
```

#### 输入型（Input，支持 two-way）

**toEditBox** - EditBox 输入绑定

```typescript
.bind('playerName', toEditBox(this.nameInput), { mode: 'two-way' })
```

**toToggle** - Toggle 开关绑定

```typescript
.bind('isEnabled', toToggle(this.toggle), { mode: 'two-way' })
```

**toSlider** - Slider 滑块绑定

```typescript
.bind('volume', toSlider(this.slider), { mode: 'two-way' })
```

### TargetViewAdapter

共享的 IView 实现，聚合多个 ViewTarget 实例。

**特性**：
- 支持一个 path 多个 target
- 统一事件总线（change 事件）
- O(1) 的 Map 查找
- 自动管理 target 的生命周期

**使用场景**：
- 由 `BindingBuilder.build()` 自动创建和管理
- 通常不需要直接使用

### CocosViewAdapter

实现 IView 接口，适配 Cocos Creator 的 Node 和 Component。

**特性**：
- 使用 `memberPath: string[]` 进行属性访问
- 支持 DisplayMapping 和 InputMapping
- 静默更新保护（_silentDepth 计数器）

**使用场景**：
- 高级场景：需要直接使用 node path 解析
- 通常使用 ViewTarget 辅助函数更简单

## 完整示例

### 示例 1: 基础数据绑定

```typescript
import { _decorator, Label, EditBox } from 'cc';
import { MVVMComponent } from '@bl-framework/mvvm-creator';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { toLabelText, toEditBox } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

interface UserData {
    name: string;
    email: string;
}

@ccclass('UserInfo')
export class UserInfo extends MVVMComponent<UserData> {
    @property(Label)
    nameLabel!: Label;
    
    @property(EditBox)
    emailInput!: EditBox;

    protected createModel(): Model<UserData> {
        return new Model<UserData>({
            name: 'John Doe',
            email: 'john@example.com'
        });
    }

    protected initViewModel(model: Model<UserData>): ViewModel<UserData> {
        return new ViewModel(model);
    }

    protected onMVVMCreate(): void {
        this.bindingBuilder
            .bind('name', toLabelText(this.nameLabel))
            .bind('email', toEditBox(this.emailInput), { mode: 'two-way' });
    }
}
```

### 示例 2: 同 path 多个 target

```typescript
import { _decorator, Label, EditBox } from 'cc';
import { MVVMComponent } from '@bl-framework/mvvm-creator';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { toLabelText, toEditBox } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

interface FormData {
    username: string;
}

@ccclass('UserForm')
export class UserForm extends MVVMComponent<FormData> {
    @property(Label)
    usernameLabel!: Label;
    
    @property(EditBox)
    usernameInput1!: EditBox;
    
    @property(EditBox)
    usernameInput2!: EditBox;

    protected createModel(): Model<FormData> {
        return new Model<FormData>({ username: 'user' });
    }

    protected initViewModel(model: Model<FormData>): ViewModel<FormData> {
        return new ViewModel(model);
    }

    protected onMVVMCreate(): void {
        // ✅ 同 path 多个 target：
        // - 'username' 绑定到 usernameLabel（display）
        // - 'username' 绑定到 usernameInput1 和 usernameInput2（两个 input，two-way）
        // silentDepth 机制自动防止回环
        this.bindingBuilder
            .bind('username', toLabelText(this.usernameLabel))
            .bind('username', toEditBox(this.usernameInput1), { mode: 'two-way' })
            .bind('username', toEditBox(this.usernameInput2), { mode: 'two-way' });
    }
}
```

### 示例 3: 格式化显示

```typescript
import { _decorator, Label, ProgressBar } from 'cc';
import { MVVMComponent } from '@bl-framework/mvvm-creator';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { toLabelText, toProgress } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

interface PlayerData {
    level: number;
    health: number;
    maxHealth: number;
}

@ccclass('PlayerStats')
export class PlayerStats extends MVVMComponent<PlayerData> {
    @property(Label)
    levelLabel!: Label;
    
    @property(Label)
    healthLabel!: Label;
    
    @property(ProgressBar)
    healthBar!: ProgressBar;

    protected createModel(): Model<PlayerData> {
        return new Model<PlayerData>({
            level: 10,
            health: 80,
            maxHealth: 100
        });
    }

    protected initViewModel(model: Model<PlayerData>): ViewModel<PlayerData> {
        return new ViewModel(model);
    }

    protected onMVVMCreate(): void {
        this.bindingBuilder
            .bind('level', toLabelText(this.levelLabel), { converter: (v: number) => `Lv.${v}` })
            .bind('health', toLabelText(this.healthLabel), { converter: (v: number) => `${v}/${this.viewModel.reactive.value.maxHealth}` })
            .bind('health', toProgress(this.healthBar), { converter: (v: number) => v / this.viewModel.reactive.value.maxHealth });
    }
}
```

## API 参考

### MVVMComponent<T>

MVVM 组件基类。

#### 抽象方法

- `createModel(): Model<T>` - 创建数据模型
- `initViewModel(model: Model<T>): ViewModel<T>` - 初始化 ViewModel
- `onMVVMCreate(): void` - 声明绑定规则（不调用 build()）

#### 生命周期

- `onLoad()` - 创建 MVVM 对象（自动调用）
- `onEnable()` - 建立绑定和订阅（自动调用）
- `onDisable()` - 断开绑定和订阅（自动调用）
- `onDestroy()` - 彻底释放资源（自动调用）

#### 属性

- `protected viewModel!: ViewModel<T>` - ViewModel 实例
- `protected bindingBuilder!: BindingBuilder<T>` - 绑定构建器
- `protected view?: TargetViewAdapter` - 共享的视图适配器

### BindingBuilder<T>

绑定构建器类。

#### 方法

- `bind<P extends Path<T> & string, TV>(path: P, target: ViewTarget<TV>, options?: BindingOptions<PathValue<T, P>, TV>): this` - 添加类型安全的数据绑定
- `build(): { bindings: DataBinding[], view: TargetViewAdapter }` - 构建所有绑定（只允许调用一次）
- `clear(): void` - 清空配置

### ViewTarget 辅助函数

#### 显示型

- `toLabelText(label: Label | null): ViewTarget<string>` - Label 文本绑定（可通过 `converter` 格式化）
- `toProgress(progressBar: ProgressBar | null): ViewTarget<number>` - ProgressBar 进度绑定（可通过 `converter` 转换，内部会 clamp 0..1）
- `toActive(node: Node | null): ViewTarget<boolean>` - Node 激活状态绑定

#### 输入型

- `toEditBox(editBox: EditBox | null, options?: { event?: EditBoxEventType }): ViewTarget<string>` - EditBox 输入绑定
- `toToggle(toggle: Toggle | null): ViewTarget<boolean>` - Toggle 开关绑定
- `toSlider(slider: Slider | null): ViewTarget<number>` - Slider 滑块绑定

## 类型安全

### 路径类型推断

```typescript
interface PlayerData {
    name: string;
    level: number;
    stats: {
        health: number;
        maxHealth: number;
    };
}

// ✅ 类型安全：路径自动提示
this.bindingBuilder
    .bind('name', toLabelText(this.nameLabel))           // ✅ 'name' 有效
    .bind('level', toLabelText(this.levelLabel))          // ✅ 'level' 有效
    .bind('stats.health', toLabelText(this.healthLabel)) // ✅ 'stats.health' 有效
    // .bind('invalid', toLabelText(this.nameLabel))      // ❌ TypeScript 错误
```

### 值类型推断

```typescript
// ✅ 转换器参数类型自动推断
this.bindingBuilder
    .bind('level', toLabelText(this.levelLabel), { converter: (v: number) => `Lv.${v}` })  // ✅ v: number
    .bind('name', toLabelText(this.nameLabel), { converter: (v: string) => v.toUpperCase() }) // ✅ v: string
```

## 注意事项

1. **生命周期管理**：
   - `onMVVMCreate()` 中只声明绑定规则，不要调用 `build()`
   - `build()` 由基类在 `onEnable` 时统一调用
   - 组件销毁时会自动清理所有资源

2. **同 path 多个 target**：
   - ✅ 支持同 path 绑定多个 display target
   - ✅ 支持同 path 绑定多个 input target（two-way）
   - ✅ 自动使用 silentDepth 机制防止回环

3. **类型安全**：
   - 充分利用 TypeScript 类型系统
   - 路径和值类型在编译时检查
   - IDE 自动补全支持

4. **性能优化**：
   - 所有重活（路径解析）在 Builder 阶段完成
   - Adapter 的 update/get 是 O(1) 的 Map 查找
   - 支持 disable/enable 循环，自动暂停/恢复绑定

5. **内存安全**：
   - 正确的生命周期管理，避免内存泄露
   - 所有订阅在 `onDisable` 和 `onDestroy` 时自动清理

## 相关链接

- [@bl-framework/mvvm](../mvvm/README.md) - MVVM 核心框架文档
- [Cocos Creator 官方文档](https://docs.cocos.com/creator/3.8/manual/zh/)

## 许可证

MIT
