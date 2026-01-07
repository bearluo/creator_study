# @bl-framework/mvvm

bl-framework MVVM 框架，提供完整的 Model-View-ViewModel 架构模式支持。

## ✨ 特性

- ✅ **类型安全**：完整的 TypeScript 类型支持，包括类型安全的路径绑定
- ✅ **响应式系统**：基于 Proxy 的自动依赖追踪和更新通知
- ✅ **数据绑定**：支持单向、双向和单向到源的数据绑定
- ✅ **框架无关**：核心模块不依赖任何 UI 框架
- ✅ **轻量级**：零运行时依赖，仅使用 TypeScript 和 ES6+ 特性
- ✅ **调试工具**：完整的调试工具链，包括日志、性能监控、依赖追踪和错误增强

## 安装

```bash
npm install @bl-framework/mvvm
```

## 快速开始

### 基本使用

```typescript
import { Model, ViewModel, Reactive, View } from '@bl-framework/mvvm';

// 1. 定义数据接口（类型安全）
interface PlayerData {
    name: string;
    health: number;
    level: number;
    maxHealth: number;
}

// 2. 定义数据模型（使用泛型）
class PlayerModel extends Model<PlayerData> {
    constructor() {
        super({
            name: 'John',
            health: 100,
            level: 1,
            maxHealth: 100
        });
    }
    
    validate(): boolean {
        // 现在有类型提示：this.data.health 是 number ✅
        return this.data.health >= 0 && this.data.health <= this.data.maxHealth;
    }
}

// 2. 实现视图接口（框架无关）
class MyView extends View {
    private elements: Map<string, any> = new Map();
    
    update(path: string, value: any): void {
        // 更新视图元素
        const element = this.elements.get(path);
        if (element) {
            element.textContent = String(value);
        }
    }
    
    get(path: string): any {
        return this.elements.get(path)?.textContent;
    }
    
    set(path: string, value: any): void {
        this.elements.set(path, { textContent: value });
        this.emit('change', path, value);
    }
    
    on(event: string, callback: (...args: any[]) => void): () => void {
        // 实现事件监听
        return () => {}; // 返回取消监听的函数
    }
    
    destroy(): void {
        this.elements.clear();
    }
    
    private emit(event: string, ...args: any[]): void {
        // 触发事件
    }
}

// 3. 创建 ViewModel（类型会自动推断）
const model = new PlayerModel();
const view = new MyView();
const viewModel = new ViewModel<PlayerData>(model);

// 4. 绑定数据到视图
viewModel.bind('name', view, { mode: 'one-way' });
viewModel.bind('health', view, { mode: 'one-way' });

// 5. 修改数据，视图自动更新（现在有类型提示）
viewModel.reactive.value.name = 'Jane'; // ✅ 类型提示：string
viewModel.reactive.value.health = 90; // ✅ 类型提示：number
```
```

### 响应式数据

```typescript
import { Reactive, Watcher } from '@bl-framework/mvvm';

// 创建响应式数据
const reactive = new Reactive({
    name: 'John',
    age: 30
});

// 监听变化
const watcher = new Watcher((key, newValue, oldValue) => {
    console.log(`${key} changed:`, oldValue, '->', newValue);
});

reactive.watch(watcher);

// 修改值会自动触发更新
reactive.value.name = 'Jane'; // 输出: name changed: John -> Jane
reactive.value.age = 31; // 输出: age changed: 30 -> 31
```

### 计算属性

```typescript
import { Reactive, Computed } from '@bl-framework/mvvm';

const reactive = new Reactive({
    firstName: 'John',
    lastName: 'Doe'
});

// 创建计算属性
const fullName = new Computed(() => {
    return `${reactive.value.firstName} ${reactive.value.lastName}`;
}, reactive);

console.log(fullName.value); // 'John Doe'

reactive.value.firstName = 'Jane';
console.log(fullName.value); // 'Jane Doe' (自动更新)
```

### 命令模式

```typescript
import { Command } from '@bl-framework/mvvm';

// 创建命令
const command = new Command(
    () => {
        console.log('Execute action');
        // 执行操作
    },
    () => {
        console.log('Undo action');
        // 撤销操作
    }
);

// 执行命令
command.execute();

// 撤销命令
if (command.canUndo()) {
    command.undo();
}
```

### 双向绑定

```typescript
interface PlayerData {
    name: string;
    level: number;
}

const model = new Model<PlayerData>({ name: 'john', level: 1 });
const viewModel = new ViewModel<PlayerData>(model);
const view = new MyView();

// 双向绑定（类型安全）
viewModel.bind('name', view, {
    mode: 'two-way',
    converter: (value: string) => value.toUpperCase(), // ✅ value 是 string 类型
    reverseConverter: (value: string) => value.toLowerCase(), // ✅ value 是 string 类型
    validator: (value: string) => value.length > 0 // ✅ value 是 string 类型
});

// 或者使用类型参数（更明确）
const options: BindingOptions<string, string> = {
    mode: 'two-way',
    converter: (value) => value.toUpperCase(), // TypeScript 自动推断 value 是 string
    reverseConverter: (value) => value.toLowerCase(),
    validator: (value) => value.length > 0
};
viewModel.bind('name', view, options);

// 修改数据，视图更新
viewModel.reactive.value.name = 'john'; // 视图显示 'JOHN'

// 修改视图，数据更新
view.set('name', 'jane'); // 数据变为 'jane'（小写）
```

## API 文档

### Model

数据模型基类，管理应用数据和业务逻辑。

#### 构造函数

```typescript
constructor(data: T)
```

创建数据模型实例。支持泛型以获得类型安全：

```typescript
interface PlayerData {
    name: string;
    level: number;
}

const model = new Model<PlayerData>({
    name: 'Player 1',
    level: 1
});
```

#### 属性

- `data: T` - 数据（只读），类型由泛型参数 `T` 指定

#### 方法

- `validate(): boolean` - 验证数据，子类可以重写此方法实现自定义验证逻辑
- `toJSON(): any` - 序列化为 JSON
- `fromJSON(json: any): void` - 从 JSON 反序列化

### ViewModel

视图模型类，连接 Model 和 View，管理数据绑定。

#### 构造函数

```typescript
constructor(model: IModel<T>)
```

创建视图模型实例。支持泛型以获得类型安全：

```typescript
interface PlayerData {
    name: string;
    level: number;
}

const model = new Model<PlayerData>({ name: 'Player 1', level: 1 });
const viewModel = new ViewModel<PlayerData>(model);

// 现在有类型提示
viewModel.reactive.value.name; // ✅ 类型提示：string
viewModel.reactive.value.level; // ✅ 类型提示：number
```

#### 属性

- `model: IModel<T>` - 数据模型（只读）
- `reactive: IReactive<T>` - 响应式数据（只读），类型由泛型参数 `T` 指定

#### 方法

- `bind<P extends Path<T>>(path: P, view: IView, options?: BindingOptions<PathValue<T, P>>): DataBinding` - 类型安全的绑定方法
- `bindMany<P extends Path<T>>(bindings: Record<P, BatchBindingItem<T, P>>): Map<P, DataBinding>` - 批量绑定方法
- `bindConfig(config: BindingConfig<T>): Map<string, DataBinding>` - 声明式绑定配置方法
- `unbind(binding: DataBinding): void` - 解绑
- `destroy(): void` - 销毁视图模型

#### 类型安全的路径绑定

`ViewModel.bind()` 方法提供类型安全的路径绑定，支持编译时类型检查和 IDE 自动补全：

```typescript
interface PlayerData {
    name: string;
    stats: {
        health: number;
        level: number;
    };
    items: Array<{ id: string; name: string }>;
}

const viewModel = new ViewModel<PlayerData>(model);

// ✅ 类型安全：IDE 自动补全，编译时检查
viewModel.bind('name', view);              // ✅ 正确
viewModel.bind('stats.health', view);      // ✅ 正确
viewModel.bind('items.0.name', view);      // ✅ 正确

// ❌ 类型错误：编译时检查
// viewModel.bind('nam', view);            // ❌ TypeScript 错误
// viewModel.bind('stats.hp', view);       // ❌ TypeScript 错误
// viewModel.bind('items.name', view);     // ❌ TypeScript 错误（items 是数组）

// ✅ 类型推断的转换器
viewModel.bind('stats.health', view, {
    converter: (health) => `Health: ${health}`,  // ✅ health: number（自动推断）
    validator: (health) => health > 0            // ✅ health: number（自动推断）
});
```

**支持的路径类型**：
- 顶层属性：`'name'`, `'level'`
- 嵌套属性：`'stats.health'`, `'stats.level'`
- 数组路径：`'items.0'`, `'items.0.name'`, `'items.0.id'`

**要求**：TypeScript >= 4.1（模板字面量类型和递归条件类型）

#### 批量绑定 API

`ViewModel.bindMany()` 方法支持一次性绑定多个路径：

```typescript
interface PlayerData {
    name: string;
    stats: { health: number; mana: number };
}

const viewModel = new ViewModel<PlayerData>(model);
const view = new MyView();

// 批量绑定
const bindings = viewModel.bindMany({
    name: { view, options: { mode: 'two-way' } },
    'stats.health': { view, options: { mode: 'one-way' } },
    'stats.mana': { view, options: { mode: 'one-way' } }
});

// 访问特定绑定
const nameBinding = bindings.get('name');
const healthBinding = bindings.get('stats.health');
```

#### 声明式绑定配置

`ViewModel.bindConfig()` 方法支持声明式绑定配置：

```typescript
interface PlayerData {
    name: string;
    level: number;
    stats: { health: number };
}

const viewModel = new ViewModel<PlayerData>(model);
const view = new MyView();

// 声明式绑定配置
const bindings = viewModel.bindConfig({
    view,
    bindings: {
        name: { mode: 'two-way' },
        level: { mode: 'one-way', converter: (level) => `Level: ${level}` },
        'stats.health': { mode: 'one-way', converter: (health) => `HP: ${health}` }
    }
});
```

#### 错误处理

`BindingOptions` 支持 `onError` 回调来处理绑定过程中的错误：

```typescript
viewModel.bind('stats.health', view, {
    mode: 'one-way',
    validator: (health) => health >= 0 && health <= 100,
    onError: (error, path, value) => {
        if (error instanceof ValidationError) {
            console.error(`验证失败: ${path} = ${value}`, error.message);
            // 实现错误恢复逻辑
        } else {
            console.error(`绑定错误: ${path}`, error);
        }
    }
});
```

**错误类型**：
- `ValidationError` - 验证错误（包含路径和值信息）
- `PathError` - 路径错误（包含路径和可用路径信息）
- `BindingError` - 绑定错误（包含路径和值信息）

### View

视图抽象基类，提供框架无关的视图接口。具体实现需要继承此类或实现 `IView` 接口。

#### 抽象方法

- `update(path: string, value: any): void` - 更新视图路径的值
- `get(path: string): any` - 获取视图路径的值
- `set(path: string, value: any): void` - 设置视图路径的值
- `on(event: string, callback: (...args: any[]) => void): () => void` - 监听视图事件
- `destroy(): void` - 销毁视图

### Reactive

响应式数据类，使用 Proxy 实现自动依赖追踪和更新通知。

#### 构造函数

```typescript
constructor(value: T)
```

创建响应式数据实例。

#### 属性

- `value: T` - 响应式值（只读）

#### 方法

- `watch(watcher: Watcher): () => void` - 添加观察者，返回取消监听的函数
- `unwatch(watcher: Watcher): void` - 移除观察者

### Watcher

观察者类，用于监听响应式数据的变化。

#### 构造函数

```typescript
constructor(
    callback: (key: string | symbol, newValue: any, oldValue: any) => void,
    runCallback?: () => void
)
```

创建观察者实例。

#### 方法

- `update(key: string | symbol, newValue: any, oldValue: any): void` - 更新回调
- `run(): void` - 运行回调
- `addDependency(key: string | symbol): void` - 添加依赖
- `getDependencies(): ReadonlySet<string | symbol>` - 获取所有依赖
- `clearDependencies(): void` - 清除依赖

### DataBinding

数据绑定类，连接响应式数据和视图。支持泛型以获得类型安全。

#### 构造函数

```typescript
constructor<TData = any, TValue = any, TViewValue = any>(
    reactive: Reactive<TData>,
    view: IView,
    path: string,
    options?: BindingOptions<TValue, TViewValue>
)
```

创建数据绑定实例。支持泛型以获得类型安全：

```typescript
interface PlayerData {
    name: string;
    level: number;
}

const reactive = new Reactive<PlayerData>({ name: 'John', level: 1 });
const view = new MyView();

// 类型安全的绑定（需要指定数据对象类型和值类型）
const binding = new DataBinding<PlayerData, string, string>(
    reactive, 
    view, 
    'name', 
    {
        mode: 'two-way',
        converter: (value: string) => value.toUpperCase() // ✅ value 是 string 类型
    }
);

// 不同类型转换
const levelBinding = new DataBinding<PlayerData, number, string>(
    reactive, 
    view, 
    'level', 
    {
        converter: (value: number) => `Lv.${value}` // ✅ value 是 number 类型
    }
);
```

#### 方法

- `destroy(): void` - 销毁绑定

### BindingManager

绑定管理器类，管理多个数据绑定。

#### 方法

- `add(binding: DataBinding): void` - 添加绑定
- `remove(binding: DataBinding): void` - 移除绑定
- `clear(): void` - 清除所有绑定
- `getAll(): ReadonlySet<DataBinding>` - 获取所有绑定
- `get size(): number` - 获取绑定数量

### Computed

计算属性类，基于响应式数据计算派生值，自动缓存和更新。

#### 构造函数

```typescript
constructor(computeFn: () => T, reactive: Reactive<any>)
```

创建计算属性实例。

#### 属性

- `value: T` - 计算值（只读）

#### 方法

- `watch(watcher: any): () => void` - 添加观察者
- `unwatch(watcher: any): void` - 移除观察者

### Command

命令类，实现命令模式，用于封装操作。

#### 构造函数

```typescript
constructor(
    executeFn: (...args: any[]) => void,
    undoFn?: () => void
)
```

创建命令实例。

#### 方法

- `execute(...args: any[]): void` - 执行命令
- `undo(): void` - 撤销命令
- `canUndo(): boolean` - 是否可以撤销

## 类型定义

### BindingOptions

绑定选项接口，支持泛型以获得类型安全。

```typescript
interface BindingOptions<TValue = any, TViewValue = any> {
    /** 绑定方向：'one-way' | 'two-way' | 'one-way-to-source' */
    mode?: 'one-way' | 'two-way' | 'one-way-to-source';
    /** 转换函数（数据 -> 视图） */
    converter?: (value: TValue) => TViewValue;
    /** 反向转换函数（视图 -> 数据） */
    reverseConverter?: (value: TViewValue) => TValue;
    /** 验证函数 */
    validator?: (value: TValue | TViewValue) => boolean;
}
```

**使用示例**：

```typescript
interface PlayerData {
    name: string;
    level: number;
}

const viewModel = new ViewModel<PlayerData>(model);

// 方式1: 直接使用（TypeScript 会从函数定义推断类型）
viewModel.bind('name', view, {
    converter: (value: string) => `Name: ${value}` // ✅ value 有类型提示
});

// 方式2: 显式指定类型参数（更明确）
const options: BindingOptions<string, string> = {
    mode: 'two-way',
    converter: (value) => value.toUpperCase(), // ✅ TypeScript 自动推断 value 是 string
    reverseConverter: (value) => value.toLowerCase(),
    validator: (value) => value.length > 0
};
viewModel.bind('name', view, options);

// 方式3: 不同类型转换（string -> number）
viewModel.bind('level', view, {
    converter: (value: number) => String(value) // ✅ value 是 number
} satisfies BindingOptions<number, string>);
```

### IModel

数据模型接口。

```typescript
interface IModel {
    readonly data: any;
    validate(): boolean;
    toJSON(): any;
    fromJSON(json: any): void;
}
```

### IView

视图接口。

```typescript
interface IView {
    update(path: string, value: any): void;
    get(path: string): any;
    set(path: string, value: any): void;
    on(event: string, callback: (...args: any[]) => void): () => void;
    destroy(): void;
}
```

### IViewModel

视图模型接口。

```typescript
interface IViewModel {
    readonly model: IModel;
    readonly reactive: IReactive<any>;
    bind(path: string, view: IView, options?: BindingOptions): DataBinding;
    unbind(binding: DataBinding): void;
    destroy(): void;
}
```

### IReactive

响应式数据接口。

```typescript
interface IReactive<T> {
    readonly value: T;
    watch(watcher: Watcher): () => void;
    unwatch(watcher: Watcher): void;
}
```

## 调试工具

MVVM 框架提供了一套完整的调试工具链，帮助开发者快速定位和解决 MVVM 相关问题。

### Debugger（调试器）

调试器主类，提供统一的调试 API。

```typescript
import { Debugger } from '@bl-framework/mvvm';

// 启用调试（必须在创建 Reactive/ViewModel/DataBinding 之前）
Debugger.enable();

// 查询 Reactive 状态
const state = Debugger.getReactiveState(reactive);
console.log('Value:', state.value);
console.log('Watchers:', state.watchers.length);

// 查询 ViewModel 状态
const vmState = Debugger.getViewModelState(viewModel);
console.log('Bindings:', vmState.bindings.length);

// 查询 DataBinding 状态
const bindingState = Debugger.getBindingState(binding);
console.log('Path:', bindingState.path);
console.log('Mode:', bindingState.mode);

// 获取依赖关系图
const graph = Debugger.getDependencyGraph(reactive);
console.log('Dependencies:', graph.paths);

// 查询路径依赖
const dependencies = Debugger.getPathDependencies(reactive, 'user.name');
const dependents = Debugger.getPathDependents(reactive, 'user');

// 查询 Watcher 依赖
const watcherDeps = Debugger.getWatcherDependencies(watcher);
```

### Logger（日志系统）

分类日志系统，支持级别控制和过滤。

```typescript
import { Logger, LogLevel, LogCategory } from '@bl-framework/mvvm';

// 启用日志
Logger.enable();

// 设置日志级别
Logger.setLevel(LogLevel.DEBUG); // DEBUG, INFO, WARN, ERROR

// 启用/禁用特定分类
Logger.setCategoryEnabled(LogCategory.REACTIVE, true);
Logger.setCategoryEnabled(LogCategory.BINDING, true);
Logger.setCategoryEnabled(LogCategory.VIEWMODEL, true);
Logger.setCategoryEnabled(LogCategory.PERFORMANCE, true);

// 记录日志
Logger.debug(LogCategory.REACTIVE, 'Reactive updated', { path: 'name' });
Logger.info(LogCategory.BINDING, 'Binding created');
Logger.warn(LogCategory.VIEWMODEL, 'Warning message');
Logger.error(LogCategory.BINDING, 'Error occurred', { error });
```

### PerformanceMonitor（性能监控）

性能监控工具，用于追踪响应式更新和绑定执行的性能。

```typescript
import { PerformanceMonitor } from '@bl-framework/mvvm';

// 启动性能监控
PerformanceMonitor.startTracking();

// 执行操作...

// 获取性能统计
const stats = PerformanceMonitor.getStats();
console.log('Reactive Updates:', {
    count: stats.reactiveUpdates.count,
    averageTime: stats.reactiveUpdates.averageTime,
    maxTime: stats.reactiveUpdates.maxTime,
    minTime: stats.reactiveUpdates.minTime
});

console.log('Binding Executions:', {
    count: stats.bindingExecutions.count,
    averageTime: stats.bindingExecutions.averageTime
});

// 生成性能报告
const report = PerformanceMonitor.generateReport();
console.log(report);

// 清除统计
PerformanceMonitor.clearStats();

// 停止性能监控
PerformanceMonitor.stopTracking();
```

### ErrorEnhancer（错误增强）

错误增强工具，提供详细的错误信息和恢复建议。

```typescript
import { ErrorEnhancer } from '@bl-framework/mvvm';

try {
    // 某些 MVVM 操作
} catch (error) {
    // 增强错误信息
    const enhanced = ErrorEnhancer.enhance(error, {
        reactive,
        viewModel,
        binding,
        customInfo: 'Additional context'
    });
    
    // 格式化并输出错误
    const formatted = ErrorEnhancer.format(enhanced);
    console.error(formatted);
    
    // 访问增强的错误信息
    console.log('Original Error:', enhanced.originalError);
    console.log('Context:', enhanced.context);
    console.log('Suggestions:', enhanced.suggestions);
}
```

### 调试工具最佳实践

1. **开发环境启用调试**：
   ```typescript
   if (process.env.NODE_ENV === 'development') {
       Debugger.enable();
       Logger.enable();
       Logger.setLevel(LogLevel.DEBUG);
   }
   ```

2. **性能分析**：
   ```typescript
   PerformanceMonitor.startTracking();
   // 执行需要分析的操作
   const stats = PerformanceMonitor.getStats();
   // 分析性能数据
   PerformanceMonitor.stopTracking();
   ```

3. **错误处理**：
   ```typescript
   try {
       // MVVM 操作
   } catch (error) {
       if (Debugger.isEnabled()) {
           const enhanced = ErrorEnhancer.enhance(error, { viewModel });
           console.error(ErrorEnhancer.format(enhanced));
       } else {
           console.error(error);
       }
   }
   ```

4. **依赖追踪**：
   ```typescript
   // 在启用调试后，可以查询依赖关系
   const graph = Debugger.getDependencyGraph(reactive);
   // 分析依赖关系，找出性能瓶颈
   ```

更多调试工具使用示例，请参考 `examples/debug-usage.ts`。

## 命名空间导出

所有功能也可以通过 `MVVM` 命名空间对象访问：

```typescript
import MVVM from '@bl-framework/mvvm';

const reactive = new MVVM.Reactive({ name: 'John' });
const watcher = new MVVM.Watcher(() => {});
const computed = new MVVM.Computed(() => {}, reactive);
```

## 使用场景

### 场景 1: 简单的数据绑定

```typescript
const model = new Model({ count: 0 });
const view = new MyView();
const viewModel = new ViewModel(model);

viewModel.bind('count', view, { mode: 'one-way' });

// 修改数据，视图自动更新
model.data.count = 10; // 视图显示 10
```

### 场景 2: 双向绑定表单

```typescript
const formModel = new Model({ username: '', password: '' });
const formView = new FormView();
const formViewModel = new ViewModel(formModel);

// 双向绑定
formViewModel.bind('username', formView, { mode: 'two-way' });
formViewModel.bind('password', formView, { mode: 'two-way' });

// 用户输入会自动更新数据
// 数据修改也会自动更新视图
```

### 场景 3: 计算属性

```typescript
const cartModel = new Model({
    items: [
        { name: 'Apple', price: 10, quantity: 2 },
        { name: 'Banana', price: 5, quantity: 3 }
    ]
});

const reactive = new Reactive(cartModel.data);
const totalPrice = new Computed(() => {
    return reactive.value.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
    }, 0);
}, reactive);

console.log(totalPrice.value); // 35
```

### 场景 4: 命令模式

```typescript
class CounterViewModel extends ViewModel {
    private history: Command[] = [];
    
    increment(): void {
        const command = new Command(
            () => {
                this.model.data.count++;
            },
            () => {
                this.model.data.count--;
            }
        );
        
        command.execute();
        this.history.push(command);
    }
    
    undo(): void {
        const command = this.history.pop();
        if (command && command.canUndo()) {
            command.undo();
        }
    }
}
```

## 指令系统

### IfDirective - 条件渲染

根据条件显示或隐藏元素：

```typescript
import { Reactive, IfDirective } from '@bl-framework/mvvm';

const reactive = new Reactive({ isVisible: true });
const element = {
    show: () => console.log('显示'),
    hide: () => console.log('隐藏'),
    visible: true
};

const directive = new IfDirective(reactive, 'isVisible');
directive.execute({ element, path: 'isVisible' });

reactive.value.isVisible = false; // 自动隐藏
```

### ForDirective - 列表渲染

根据数组数据渲染列表：

```typescript
import { Reactive, ForDirective } from '@bl-framework/mvvm';

const reactive = new Reactive({
    items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
    ]
});

const container = {
    clear: () => {},
    createItem: (index, item, key) => {
        console.log(`创建项 ${key}:`, item);
        return { id: key, data: item };
    },
    removeItem: (item) => {
        console.log('移除项:', item);
    },
    getItems: () => []
};

const directive = new ForDirective(reactive, 'items');
directive.execute({
    container,
    path: 'items',
    itemKey: (item) => item.id // 使用 id 作为唯一键
});

reactive.value.items.push({ id: 3, name: 'Item 3' }); // 自动创建新项
```

### OnDirective - 事件绑定

绑定事件处理器：

```typescript
import { Reactive, OnDirective } from '@bl-framework/mvvm';

const reactive = new Reactive({
    onClick: () => console.log('点击了'),
    onHover: () => console.log('悬停了')
});

const element = {
    on: (event, handler) => {
        console.log(`绑定事件 ${event}`);
        return () => console.log(`解绑事件 ${event}`);
    },
    off: (event, handler) => {
        console.log(`解绑事件 ${event}`);
    }
};

const directive = new OnDirective(reactive, 'click', 'onClick');
directive.execute({ element, eventName: 'click', handlerPath: 'onClick' });
```

### BindDirective - 属性绑定

绑定属性到元素：

```typescript
import { Reactive, BindDirective } from '@bl-framework/mvvm';

const reactive = new Reactive({ title: 'Hello', count: 10 });

const element = {
    setProperty: (name, value) => {
        console.log(`设置属性 ${name} = ${value}`);
    },
    getProperty: (name) => {
        return undefined;
    }
};

const directive = new BindDirective(reactive, 'title', 'text', {
    mode: 'one-way',
    converter: (value) => value.toUpperCase()
});

directive.execute({ element, propertyName: 'text', path: 'title' });

reactive.value.title = 'World'; // 自动更新为 'WORLD'
```

## 注意事项

1. **Proxy 支持**: 本框架使用 ES6 Proxy 实现响应式，需要现代浏览器或 Node.js 环境支持。

2. **性能优化**: 响应式系统使用批量更新优化，多个属性变化会在下一个事件循环中批量处理。

3. **循环引用**: 避免在响应式数据中创建循环引用，这可能导致内存泄漏。

4. **深层次对象**: 响应式系统支持嵌套对象，会自动为深层对象创建 Proxy。

5. **数组支持**: 响应式系统支持数组，数组操作（push、pop、splice 等）会触发更新。

## 许可证

MIT

