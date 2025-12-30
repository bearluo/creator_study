# @bl-framework/mvvm-creator

bl-framework MVVM 框架的 Cocos Creator 集成模块，提供完整的 Cocos Creator 组件和数据绑定支持。

## 安装

```bash
npm install @bl-framework/mvvm-creator @bl-framework/mvvm
```

**注意**: 本模块需要在 Cocos Creator 3.8+ 项目中使用。

## 快速开始

### 方式 1: 使用装饰器（推荐，最简洁）

```typescript
import { _decorator, Component, Label, Button } from 'cc';
import { Model, ViewModel } from '@bl-framework/mvvm';
import { MVVMComponent, bind, on, ifDirective } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

@ccclass('MyComponent')
export class MyComponent extends MVVMComponent {
    // 直接应用到属性上（推荐，无需指定 target）
    @property(Label)
    @bind('title', { property: 'string' })
    titleLabel: Label | null = null;
    
    @property(Button)
    @on('click', { handler: 'onAction' })
    actionButton: Button | null = null;
    
    protected initViewModel(model: Model): ViewModel {
        return new ViewModel(model);
    }
    
    protected createModel(): Model {
        return new Model({ title: 'Hello World' });
    }
    
    onAction(): void {
        console.log('Button clicked!');
    }
}
```

**改进说明**：
- ✅ 装饰器可以直接应用到 `@property` 属性上
- ✅ 自动推断 `target`（使用装饰器所在的属性名）
- ✅ 代码更简洁，无需占位符属性
- ✅ 向后兼容：仍支持 `target` 选项用于占位符方式

### 方式 2: 使用构建器（灵活，适合动态场景，类型安全）

```typescript
import { _decorator, Component, Label, Button } from 'cc';
import { Model, ViewModel, ValidationError } from '@bl-framework/mvvm';
import { MVVMComponent } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

// 定义数据类型（类型安全）
interface MyData {
    title: string;
    count: number;
}

@ccclass('MyComponent')
export class MyComponent extends MVVMComponent<MyData> {
    @property(Label)
    titleLabel: Label | null = null;
    
    @property(Button)
    actionButton: Button | null = null;
    
    protected initViewModel(model: Model<MyData>): ViewModel<MyData> {
        return new ViewModel(model);
    }
    
    protected createModel(): Model<MyData> {
        return new Model<MyData>({ 
            title: 'Hello World',
            count: 0
        });
    }
    
    protected onMVVMLoad(): void {
        // 使用类型安全的构建器模式
        this.bindingBuilder
            .bind('title', this.titleLabel, 'string', {
                converter: (v) => `Title: ${v}`  // ✅ v: string（自动推断）
            })
            .bind('count', this.titleLabel, 'string', {
                converter: (v) => `Count: ${v}`,  // ✅ v: number（自动推断）
                validator: (v) => v >= 0,
                onError: (error, path, value) => {
                    if (error instanceof ValidationError) {
                        console.error(`验证失败: ${path} = ${value}`, error.message);
                    }
                }
            })
            .on('click', this.actionButton, this.onAction.bind(this))
            .build();
        
        // ❌ 类型错误示例（编译时检查）
        // this.bindingBuilder.bind('titl', this.titleLabel);        // ❌ TypeScript 错误
        // this.bindingBuilder.bind('count.name', this.titleLabel);   // ❌ TypeScript 错误
    }
    
    onAction(): void {
        console.log('Button clicked!');
    }
}
```

### 方式 3: 使用 ViewModelComponent（简化版）

```typescript
import { _decorator, Component, Label } from 'cc';
import { ViewModelComponent, CocosViewAdapter } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

@ccclass('MyComponent')
export class MyComponent extends ViewModelComponent {
    @property(Label)
    titleLabel: Label | null = null;
    
    onLoad() {
        super.onLoad();
        
        // 创建视图适配器
        this.viewAdapter = new CocosViewAdapter({
            rootNode: this.node,
            mappings: [
                { 
                    path: 'titleLabel', 
                    viewPath: 'title', 
                    componentType: 'Label', 
                    propertyName: 'string' 
                }
            ]
        });
        
        // 绑定数据
        this.viewModel!.bind('title', this.viewAdapter, { mode: 'one-way' });
        
        // 设置数据
        this.setData({ title: 'Hello World' });
    }
}
```

// 方式 2: 使用 MVVMComponent（更灵活）
@ccclass('MyMVVMComponent')
export class MyMVVMComponent extends MVVMComponent {
    @property(Label)
    titleLabel: Label | null = null;
    
    protected initViewModel(model: Model): ViewModel {
        const { ViewModel } = require('@bl-framework/mvvm');
        const viewModel = new ViewModel(model);
        
        // 配置视图适配器
        this.viewAdapter = new CocosViewAdapter({
            rootNode: this.node,
            mappings: [
                { 
                    path: 'titleLabel', 
                    viewPath: 'title', 
                    componentType: 'Label', 
                    propertyName: 'string' 
                }
            ]
        });
        
        // 绑定数据
        viewModel.bind('title', this.viewAdapter, { mode: 'one-way' });
        
        return viewModel;
    }
    
    protected createModel(): Model {
        const { Model } = require('@bl-framework/mvvm');
        return new Model({ title: 'Hello World' });
    }
}
```

## 核心功能

### 装饰器系统

#### @bind - 数据绑定装饰器

声明式地定义数据绑定，减少样板代码。

```typescript
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent {
    @property(Label)
    nameLabel: Label | null = null;
    
    @property(Label)
    levelLabel: Label | null = null;
    
    // 使用装饰器声明绑定
    @bind('name', { target: 'nameLabel', property: 'string' })
    @bind('level', { target: 'levelLabel', property: 'string', converter: (v) => `Lv.${v}` })
    private viewModel!: any;
}
```

#### @on - 事件绑定装饰器

声明式地定义事件绑定。

```typescript
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent {
    @property(Button)
    levelUpButton: Button | null = null;
    
    @on('click', { target: 'levelUpButton', handler: 'onLevelUp' })
    private events!: any;
    
    onLevelUp(): void {
        // 处理升级逻辑
    }
}
```

#### @if - 条件渲染装饰器

声明式地定义条件渲染。

```typescript
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent {
    @property(Node)
    infoPanel: Node | null = null;
    
    @ifDirective('showInfo', { target: 'infoPanel' })
    private conditions!: any;
}
```

#### @for - 列表渲染装饰器

声明式地定义列表渲染。

```typescript
@ccclass('ItemList')
export class ItemList extends MVVMComponent {
    @property(Node)
    containerNode: Node | null = null;
    
    @property(Node)
    itemTemplate: Node | null = null;
    
    @forDirective('items', { 
        container: 'containerNode', 
        template: 'itemTemplate',
        key: (item) => item.id
    })
    private lists!: any;
}
```

### 构建器系统

#### BindingBuilder

提供类型安全的流畅 API 来构建数据绑定、事件绑定等。

```typescript
// 定义数据类型（类型安全）
interface PlayerData {
    name: string;
    level: number;
    showInfo: boolean;
}

@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent<PlayerData> {
    @property(Label)
    nameLabel: Label | null = null;
    
    @property(Label)
    levelLabel: Label | null = null;
    
    @property(Button)
    levelUpButton: Button | null = null;
    
    @property(Node)
    infoPanel: Node | null = null;
    
    protected onMVVMLoad(): void {
        // 使用类型安全的构建器模式
        this.bindingBuilder
            .bind('name', this.nameLabel, 'string')  // ✅ 类型安全
            .bind('level', this.levelLabel, 'string', { 
                converter: (v) => `Lv.${v}`  // ✅ v: number（自动推断）
            })
            .on('click', this.levelUpButton, this.onLevelUp.bind(this))
            .if('showInfo', this.infoPanel)
            .build();
        
        // 或者使用批量绑定方法
        this.bindingBuilder.bindMany({
            name: {
                target: this.nameLabel,
                property: 'string',
                options: { mode: 'one-way' }
            },
            level: {
                target: this.levelLabel,
                property: 'string',
                options: { 
                    mode: 'one-way',
                    converter: (v) => `Lv.${v}`  // ✅ v: number（自动推断）
                }
            }
        }).build();
    }
}
```

### 适配器

#### CocosViewAdapter

将 Cocos Creator Node 适配为 MVVM View 接口，支持节点路径映射和组件属性绑定。

```typescript
import { CocosViewAdapter } from '@bl-framework/mvvm-creator';

const adapter = new CocosViewAdapter({
    rootNode: this.node,
    mappings: [
        {
            path: 'titleLabel',        // 节点路径
            viewPath: 'title',         // 视图路径（用于数据绑定）
            componentType: 'Label',    // 组件类型
            propertyName: 'string'     // 属性名称
        }
    ]
});

viewModel.bind('title', adapter, { mode: 'one-way' });
```

#### CocosComponentAdapter

将 Cocos Creator Component 适配为 MVVM View 接口，提供组件级别的属性绑定和事件绑定。

```typescript
import { CocosComponentAdapter } from '@bl-framework/mvvm-creator';

const adapter = new CocosComponentAdapter({
    component: this,
    propertyBindings: [
        {
            propertyName: 'label.string',
            viewPath: 'title',
            converter: (value) => value.toUpperCase()
        }
    ],
    eventBindings: [
        {
            eventName: 'click',
            viewPath: 'onClick'
        }
    ]
});

viewModel.bind('title', adapter, { mode: 'two-way' });
```

### 指令

#### CocosIfDirective - 条件渲染

根据条件显示或隐藏 Cocos Creator Node。

```typescript
import { Reactive } from '@bl-framework/mvvm';
import { CocosIfDirective } from '@bl-framework/mvvm-creator';

const reactive = new Reactive({ isVisible: true });
const directive = new CocosIfDirective(reactive, 'isVisible');

directive.execute({
    node: this.node,
    path: 'isVisible'
});

reactive.value.isVisible = false; // 节点自动隐藏
```

#### CocosForDirective - 列表渲染

根据数组数据渲染 Cocos Creator Node 列表。

```typescript
import { Reactive } from '@bl-framework/mvvm';
import { CocosForDirective } from '@bl-framework/mvvm-creator';

const reactive = new Reactive({
    items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
    ]
});

const directive = new CocosForDirective(reactive, 'items');

directive.execute({
    containerNode: this.containerNode,
    itemTemplate: this.itemTemplate,
    path: 'items',
    itemKey: (item) => item.id
});

reactive.value.items.push({ id: 3, name: 'Item 3' }); // 自动创建新节点
```

#### CocosOnDirective - 事件绑定

绑定事件处理器到 Cocos Creator Node。

```typescript
import { Reactive } from '@bl-framework/mvvm';
import { CocosOnDirective } from '@bl-framework/mvvm-creator';

const reactive = new Reactive({
    onClick: () => console.log('clicked'),
    onHover: () => console.log('hovered')
});

const directive = new CocosOnDirective(reactive, 'click', 'onClick');

directive.execute({
    node: this.node,
    eventName: 'click',
    handlerPath: 'onClick'
});
```

#### CocosBindDirective - 属性绑定

绑定属性到 Cocos Creator Node 或 Component。

```typescript
import { Reactive } from '@bl-framework/mvvm';
import { CocosBindDirective } from '@bl-framework/mvvm-creator';

const reactive = new Reactive({ title: 'Hello' });

const directive = new CocosBindDirective(reactive, 'title', 'string', {
    componentType: 'Label'
});

directive.execute({
    node: this.node,
    componentType: 'Label',
    propertyName: 'string',
    path: 'title'
});

reactive.value.title = 'World'; // Label 的 string 属性自动更新
```

## 装饰器 API

### @bind

数据绑定装饰器。

```typescript
@bind(path: string, options?: BindOptions)
```

**参数**:
- `path`: 数据路径（如 'name', 'player.level'）
- `options`: 绑定选项
  - `target`: 目标属性名称（组件中的 @property 属性名）
  - `property`: 组件属性名称（如 'string', 'spriteFrame'）
  - `componentType`: 组件类型名称（如 'Label', 'Button'）
  - `mode`: 绑定模式（'one-way' | 'two-way' | 'one-way-to-source'）
  - `converter`: 值转换函数
  - `reverseConverter`: 反向转换函数（用于双向绑定）
  - `validator`: 验证函数

### @on

事件绑定装饰器。

```typescript
@on(event: string, options?: OnOptions)
```

**参数**:
- `event`: 事件名称（如 'click', 'touchstart'）
- `options`: 事件绑定选项
  - `target`: 目标属性名称（组件中的 @property 属性名）
  - `handler`: 事件处理函数名称或路径

### @if

条件渲染装饰器。

```typescript
@ifDirective(path: string, options?: IfOptions)
```

**参数**:
- `path`: 数据路径（如 'showInfo', 'player.isVisible'）
- `options`: 条件渲染选项
  - `target`: 目标属性名称（组件中的 @property 属性名）

### @for

列表渲染装饰器。

```typescript
@forDirective(path: string, options?: ForOptions)
```

**参数**:
- `path`: 数据路径（如 'items', 'player.inventory'）
- `options`: 列表渲染选项
  - `container`: 容器节点属性名称
  - `template`: 模板节点属性名称
  - `key`: 项的唯一键字段名或函数

## 构建器 API

### BindingBuilder

绑定构建器类。

**方法**:
- `bind<P extends Path<T> & string>(path: P, target, property?, options?)`: 添加类型安全的数据绑定
- `bindMany<P extends Path<T> & string>(bindings)`: 批量添加类型安全的数据绑定
- `on(event, target, handler)`: 添加事件绑定
- `if(path, target)`: 添加条件渲染
- `build()`: 构建所有绑定（使用批量绑定 API）

**类型安全特性**:
- ✅ IDE 自动补全：路径自动提示
- ✅ 编译时类型检查：无效路径会在编译时报错
- ✅ 类型推断：转换器和验证器的参数类型自动推断
- ✅ 错误处理：支持 `onError` 回调处理绑定错误

## 组件 API

### MVVMComponent

MVVM 组件基类，提供 ViewModel 集成和自动数据绑定功能。

#### 方法

- `protected abstract initViewModel(model: Model): ViewModel` - 初始化 ViewModel（子类必须实现）
- `protected createModel(): Model` - 创建数据模型（子类可以重写）
- `protected createViewAdapter(): CocosViewAdapter` - 创建视图适配器（子类可以重写）
- `protected onMVVMLoad(): void` - MVVM 初始化完成后的回调（子类可以重写）
- `onLoad(): void` - 组件加载时调用（自动处理装饰器绑定）
- `onDestroy(): void` - 组件销毁时调用（自动清理资源）

#### 属性

- `protected viewModel!: ViewModel` - ViewModel 实例
- `protected viewAdapter!: CocosViewAdapter` - 视图适配器
- `protected componentAdapter?: CocosComponentAdapter` - 组件适配器
- `protected bindingBuilder!: BindingBuilder` - 绑定构建器

### ViewModelComponent

简化版的 MVVM 组件，自动创建 ViewModel 和适配器。

#### 方法

- `setData(data: any): void` - 设置数据
- `getData(): any` - 获取数据
- `updateData(path: string, value: any): void` - 更新数据路径的值
- `getDataValue(path: string): any` - 获取数据路径的值

## 完整示例

### 示例 1: 简单的数据绑定

```typescript
import { _decorator, Component, Label, Button } from 'cc';
import { ViewModelComponent, CocosViewAdapter } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

@ccclass('PlayerInfo')
export class PlayerInfo extends ViewModelComponent {
    @property(Label)
    nameLabel: Label | null = null;
    
    @property(Label)
    levelLabel: Label | null = null;
    
    @property(Button)
    levelUpButton: Button | null = null;
    
    onLoad() {
        super.onLoad();
        
        // 创建视图适配器
        this.viewAdapter = new CocosViewAdapter({
            rootNode: this.node,
            mappings: [
                { path: 'nameLabel', viewPath: 'name', componentType: 'Label', propertyName: 'string' },
                { path: 'levelLabel', viewPath: 'level', componentType: 'Label', propertyName: 'string' }
            ]
        });
        
        // 绑定数据
        this.viewModel!.bind('name', this.viewAdapter, { mode: 'one-way' });
        this.viewModel!.bind('level', this.viewAdapter, { mode: 'one-way' });
        
        // 设置初始数据
        this.setData({
            name: 'Player 1',
            level: 1
        });
        
        // 绑定按钮事件
        if (this.levelUpButton) {
            this.levelUpButton.node.on('click', () => {
                const level = this.getDataValue('level') || 0;
                this.updateData('level', level + 1);
                this.updateData('levelLabel.string', `Level: ${level + 1}`);
            });
        }
    }
}
```

### 示例 2: 列表渲染

```typescript
import { _decorator, Component, Node, Label } from 'cc';
import { Reactive } from '@bl-framework/mvvm';
import { CocosForDirective } from '@bl-framework/mvvm-creator';

const { ccclass, property } = _decorator;

@ccclass('ItemList')
export class ItemList extends Component {
    @property(Node)
    containerNode: Node | null = null;
    
    @property(Node)
    itemTemplate: Node | null = null;
    
    private reactive: Reactive<any>;
    private forDirective: CocosForDirective;
    
    onLoad() {
        this.reactive = new Reactive({
            items: [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }
            ]
        });
        
        this.forDirective = new CocosForDirective(this.reactive, 'items');
        this.forDirective.execute({
            containerNode: this.containerNode!,
            itemTemplate: this.itemTemplate!,
            path: 'items',
            itemKey: (item) => item.id
        });
    }
    
    addItem(name: string) {
        const items = this.reactive.value.items || [];
        const newId = Math.max(...items.map((i: any) => i.id), 0) + 1;
        this.reactive.value.items = [...items, { id: newId, name }];
    }
    
    onDestroy() {
        this.forDirective?.destroy();
    }
}
```

## 注意事项

1. **类型定义**: 本模块使用 `@cocos/creator-types` 提供类型定义，需要确保已正确安装。
2. **生命周期**: MVVM 组件会在 `onLoad` 时初始化 ViewModel，在 `onDestroy` 时清理资源。
3. **性能优化**: 大量数据绑定场景建议使用批量更新或虚拟列表优化。
4. **事件绑定**: Cocos Creator 的事件系统与 MVVM 的事件绑定机制需要正确配合使用。

## 相关链接

- [@bl-framework/mvvm](../mvvm/README.md) - MVVM 核心框架文档
- [Cocos Creator 官方文档](https://docs.cocos.com/creator/3.8/manual/zh/)

## 许可证

MIT

