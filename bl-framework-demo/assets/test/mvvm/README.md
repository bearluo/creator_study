# MVVM 框架测试用例

## 📋 概述

本目录包含 MVVM 框架在 Cocos Creator 中的使用示例和测试用例。

## 📝 测试组件

### MVVMExample（构建器方式）

使用 `BindingBuilder` 构建数据绑定的完整示例，展示：
- 数据模型创建
- ViewModel 初始化
- 使用构建器模式绑定数据
- 使用构建器模式绑定事件
- 条件渲染指令

**使用场景**：
- 玩家信息展示
- 等级和经验值管理
- 生命值系统
- 需要动态配置绑定的场景

### PlayerInfoComponent（装饰器方式）

使用装饰器简化 MVVM 使用的示例，展示：
- 使用 `@bind` 装饰器声明数据绑定
- 使用 `@on` 装饰器声明事件绑定
- 使用 `@ifDirective` 装饰器声明条件渲染
- 声明式编程，代码简洁

**使用场景**：
- 静态绑定配置
- 代码简洁性要求高的场景
- 类型安全要求高的项目

### PlayerInfoBuilderComponent（构建器方式）

使用 `BindingBuilder` 的简化示例，展示：
- 流畅的链式 API
- 运行时配置绑定
- 支持复杂的转换逻辑

**使用场景**：
- 需要动态配置的场景
- 复杂的转换逻辑
- 运行时决定绑定的场景

### ItemListComponent

列表组件示例，展示：
- 使用 `CocosForDirective` 进行列表渲染
- 动态添加/删除项目
- 响应式列表更新

**使用场景**：
- 道具列表
- 背包系统
- 动态列表展示

### ListItemComponent（装饰器方式）

列表项组件，展示：
- 使用装饰器声明数据绑定
- 使用装饰器声明事件绑定
- 声明式编程

**使用场景**：
- 列表项模板
- 需要简洁代码的场景

### ItemListComponent

列表组件，展示：
- 使用 `CocosForDirective` 进行列表渲染
- 动态添加/删除项目
- 响应式列表更新

**使用场景**：
- 道具列表
- 背包系统
- 动态列表展示

## 🚀 快速开始

### 1. 创建场景

1. 在 Cocos Creator 中创建新场景
2. 添加 Canvas 节点
3. 添加测试组件到 Canvas 或子节点

### 2. 使用装饰器方式（推荐，代码最简洁）

```typescript
// 在场景中添加 PlayerInfoComponent 组件
// 配置以下属性：
// - nameLabel: 名称标签
// - levelLabel: 等级标签
// - healthLabel: 生命值标签
// - levelUpButton: 升级按钮
// - takeDamageButton: 受到伤害按钮
// - healButton: 治疗按钮
// - infoPanel: 信息面板节点

// 代码示例：
@ccclass('PlayerInfoComponent')
export class PlayerInfoComponent extends MVVMComponent {
    @property(Label)
    nameLabel: Label | null = null;
    
    @bind('name', { target: 'nameLabel', property: 'string' })
    @on('click', { target: 'levelUpButton', handler: 'onLevelUp' })
    private _placeholder!: any;
}
```

### 3. 使用构建器方式（灵活，适合动态场景）

```typescript
// 在场景中添加 MVVMExample 或 PlayerInfoBuilderComponent 组件
// 配置相同的属性

// 代码示例：
protected onMVVMLoad(): void {
    this.bindingBuilder
        .bind('name', this.nameLabel, 'string')
        .on('click', this.levelUpButton, this.onLevelUp.bind(this))
        .build();
}
```

### 4. 使用列表组件

```typescript
// 在场景中添加 ItemListComponent 组件
// 配置以下属性：
// - containerNode: 容器节点（列表项父节点）
// - itemTemplate: 列表项模板节点（需要包含 ListItemComponent）
// - addItemButton: 添加项目按钮
```

### 4. 使用 ItemListComponent

```typescript
// 在场景中添加 ItemListComponent 组件
// 配置以下属性：
// - containerNode: 容器节点（列表项父节点）
// - itemTemplate: 列表项模板节点（需要包含 ListItemComponent）
// - addItemButton: 添加项目按钮
```

## 📖 API 使用示例

### 基本数据绑定

```typescript
import { Model, ViewModel } from '@bl-framework/mvvm';
import { CocosViewAdapter } from '@bl-framework/mvvm-creator';

// 创建模型
const model = new Model({ name: 'Player 1', level: 1 });

// 创建 ViewModel
const viewModel = new ViewModel(model);

// 创建适配器
const adapter = new CocosViewAdapter({
    rootNode: this.node,
    mappings: [
        { path: 'nameLabel', viewPath: 'name', componentType: 'Label', propertyName: 'string' }
    ]
});

// 绑定数据
viewModel.bind('name', adapter, { mode: 'one-way' });
```

### 条件渲染

```typescript
import { Reactive } from '@bl-framework/mvvm';
import { CocosIfDirective } from '@bl-framework/mvvm-creator';

const reactive = new Reactive({ isVisible: true });
const directive = new CocosIfDirective(reactive, 'isVisible');
directive.execute({ node: this.infoPanel, path: 'isVisible' });

// 切换显示
reactive.value.isVisible = false; // 节点自动隐藏
```

### 列表渲染

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

// 添加项目
reactive.value.items.push({ id: 3, name: 'Item 3' });
```

### 使用装饰器方式（推荐）

```typescript
import { MVVMComponent, bind, on } from '@bl-framework/mvvm-creator';

@ccclass('MyComponent')
export class MyComponent extends MVVMComponent {
    @property(Label)
    titleLabel: Label | null = null;
    
    @bind('title', { target: 'titleLabel', property: 'string', componentType: 'Label' })
    private _placeholder!: any;
    
    protected initViewModel(model: Model): ViewModel {
        return new ViewModel(model);
    }
    
    protected createModel(): Model {
        return new Model({ title: 'Hello World' });
    }
}
```

### 使用构建器方式

```typescript
import { MVVMComponent } from '@bl-framework/mvvm-creator';

@ccclass('MyComponent')
export class MyComponent extends MVVMComponent {
    @property(Label)
    titleLabel: Label | null = null;
    
    protected onMVVMLoad(): void {
        this.bindingBuilder
            .bind('title', this.titleLabel, 'string')
            .build();
    }
    
    protected createModel(): Model {
        return new Model({ title: 'Hello World' });
    }
}
```

### 使用 ViewModelComponent（传统方式）

```typescript
import { ViewModelComponent, CocosViewAdapter } from '@bl-framework/mvvm-creator';

@ccclass('MyComponent')
export class MyComponent extends ViewModelComponent {
    @property(Label)
    titleLabel: Label | null = null;
    
    onLoad() {
        super.onLoad();
        
        // 创建适配器
        this.viewAdapter = new CocosViewAdapter({
            rootNode: this.node,
            mappings: [
                { path: 'titleLabel', viewPath: 'title', componentType: 'Label', propertyName: 'string' }
            ]
        });
        
        // 绑定数据
        this.viewModel!.bind('title', this.viewAdapter, { mode: 'one-way' });
        
        // 设置数据
        this.setData({ title: 'Hello World' });
    }
}
```

## ⚠️ 注意事项

1. **链接包**: 确保已在项目中链接 `@bl-framework/mvvm` 和 `@bl-framework/mvvm-creator` 包
2. **构建**: 修改包代码后需要重新构建（`npm run build`）
3. **类型定义**: 确保 TypeScript 配置正确，能够识别链接的包
4. **生命周期**: MVVM 组件会在 `onDestroy` 时自动清理资源
5. **性能**: 大量数据绑定场景建议使用批量更新优化

## 🔗 相关链接

- [MVVM 核心框架文档](../../../../packages/mvvm/README.md)
- [MVVM Creator 集成文档](../../../../packages/mvvm-creator/README.md)

---

*最后更新: 2025-12-24*

