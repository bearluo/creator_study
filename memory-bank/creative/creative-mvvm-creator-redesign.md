# CREATIVE PHASE: MVVM Creator 模块重新设计

📌 CREATIVE PHASE START: MVVM Creator Module Redesign
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM

**Description**: 重新设计 `@bl-framework/mvvm-creator` 模块，解决当前实现中的问题，提供更好的开发体验和更强大的功能。

**当前问题**:
1. **API 复杂度**: 使用适配器需要手动配置映射，代码冗长
2. **类型安全**: 组件类型和属性路径缺乏类型检查
3. **指令使用**: 指令需要手动创建和管理，不够直观
4. **生命周期**: ViewModel 和适配器的生命周期管理分散
5. **性能**: 大量绑定场景下可能存在性能问题
6. **易用性**: 对于简单场景，使用门槛较高

**Requirements**:
- 提供更简洁的 API，减少样板代码
- 增强类型安全，支持 TypeScript 类型推断
- 支持装饰器模式，简化数据绑定声明
- 自动管理生命周期，减少手动清理代码
- 提供性能优化选项（批量更新、虚拟列表等）
- 保持向后兼容或提供迁移路径
- 支持更灵活的配置方式

**Constraints**:
- 必须与 Cocos Creator 3.8+ 兼容
- 必须基于 `@bl-framework/mvvm` 核心模块
- 不能破坏现有 API（或提供清晰的迁移指南）
- 需要保持框架无关的核心设计理念

## 2️⃣ OPTIONS

### Option A: 装饰器增强方案（推荐）

**实现**：
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
    @bind('health', { target: 'healthLabel', property: 'string' })
    private viewModel!: ViewModel;
    
    // 使用装饰器声明事件
    @on('click', { target: 'levelUpButton', handler: 'onLevelUp' })
    private events!: EventBindings;
    
    // 使用装饰器声明条件渲染
    @if('showInfo', { target: 'infoPanel' })
    private conditions!: ConditionalBindings;
}
```

**特点**：
- ✅ 声明式 API，代码简洁
- ✅ 编译时类型检查
- ✅ 自动生命周期管理
- ✅ 减少样板代码
- ⚠️ 需要装饰器支持（Cocos Creator 已支持）
- ⚠️ 学习曲线稍陡

### Option B: 构建器模式方案

**实现**：
```typescript
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent {
    @property(Label)
    nameLabel: Label | null = null;
    
    onLoad() {
        super.onLoad();
        
        // 使用构建器模式
        this.setupBindings()
            .bind('name', this.nameLabel, 'string')
            .bind('level', this.levelLabel, 'string', { converter: (v) => `Lv.${v}` })
            .bind('health', this.healthLabel, 'string')
            .on('click', this.levelUpButton, this.onLevelUp)
            .if('showInfo', this.infoPanel)
            .build();
    }
}
```

**特点**：
- ✅ 流畅的 API
- ✅ 运行时配置，灵活性高
- ✅ 易于理解和学习
- ⚠️ 仍然需要一些样板代码
- ⚠️ 类型推断有限

### Option C: 配置对象方案

**实现**：
```typescript
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent {
    protected getBindingConfig() {
        return {
            bindings: [
                { path: 'name', target: 'nameLabel', property: 'string' },
                { path: 'level', target: 'levelLabel', property: 'string', converter: (v) => `Lv.${v}` },
                { path: 'health', target: 'healthLabel', property: 'string' }
            ],
            events: [
                { event: 'click', target: 'levelUpButton', handler: 'onLevelUp' }
            ],
            conditions: [
                { path: 'showInfo', target: 'infoPanel' }
            ]
        };
    }
}
```

**特点**：
- ✅ 配置与逻辑分离
- ✅ 易于序列化和持久化
- ✅ 支持动态配置
- ⚠️ 类型安全较弱
- ⚠️ 运行时错误风险

### Option D: 混合方案（推荐）

**实现**：结合 Option A + Option B
- 装饰器用于简单场景（推荐）
- 构建器用于复杂场景或动态配置
- 配置对象用于数据驱动场景

```typescript
// 简单场景：使用装饰器
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent {
    @bind('name', { target: 'nameLabel', property: 'string' })
    private viewModel!: ViewModel;
}

// 复杂场景：使用构建器
@ccclass('ComplexComponent')
export class ComplexComponent extends MVVMComponent {
    onLoad() {
        super.onLoad();
        
        // 动态绑定
        const items = this.getItems();
        items.forEach((item, index) => {
            this.bindingBuilder
                .bind(`items.${index}.name`, item.nameLabel, 'string')
                .bind(`items.${index}.value`, item.valueLabel, 'string');
        });
    }
}
```

**特点**：
- ✅ 灵活性最高
- ✅ 适应不同场景
- ✅ 渐进式采用
- ⚠️ API 复杂度稍高
- ⚠️ 需要维护多套 API

## 3️⃣ ANALYSIS

### Option A: 装饰器增强方案

**优点**：
- 声明式编程，代码最简洁
- 编译时类型检查，类型安全
- 自动管理生命周期
- 符合现代 TypeScript 开发习惯
- 减少运行时错误

**缺点**：
- 需要理解装饰器概念
- 装饰器配置可能复杂
- 调试可能稍困难（装饰器在编译时处理）

**适用场景**：
- 大多数常见场景
- 静态绑定配置
- 类型安全要求高的项目

### Option B: 构建器模式方案

**优点**：
- API 流畅，易于理解
- 运行时配置，灵活性高
- 易于调试
- 支持条件绑定

**缺点**：
- 仍然需要一些样板代码
- 类型推断有限
- 可能产生较长的链式调用

**适用场景**：
- 动态绑定场景
- 需要条件逻辑的绑定
- 复杂的数据流

### Option C: 配置对象方案

**优点**：
- 配置与逻辑完全分离
- 易于序列化和持久化
- 支持数据驱动
- 易于测试

**缺点**：
- 类型安全较弱
- 运行时错误风险
- 缺乏 IDE 智能提示

**适用场景**：
- 数据驱动的 UI
- 需要持久化配置
- 动态 UI 生成

### Option D: 混合方案

**优点**：
- 灵活性最高
- 适应各种场景
- 渐进式采用
- 向后兼容

**缺点**：
- API 复杂度较高
- 需要维护多套 API
- 学习成本稍高

**适用场景**：
- 大型项目
- 需要灵活性的场景
- 渐进式迁移

## 4️⃣ DECISION

**选择**: Option D - 混合方案

**理由**:
1. **灵活性**: 不同场景需要不同的 API 风格
2. **渐进式**: 可以从简单 API 开始，逐步使用高级功能
3. **向后兼容**: 可以保留现有 API，同时提供新 API
4. **最佳实践**: 装饰器用于常见场景，构建器用于复杂场景

**实现策略**:
1. **核心改进**:
   - 增强 `MVVMComponent` 基类，提供装饰器支持
   - 添加 `BindingBuilder` 构建器类
   - 提供配置对象接口（可选）
   - 自动生命周期管理

2. **装饰器实现**:
   - `@bind()` - 数据绑定装饰器
   - `@on()` - 事件绑定装饰器
   - `@if()` - 条件渲染装饰器
   - `@for()` - 列表渲染装饰器

3. **构建器实现**:
   - `BindingBuilder` - 流畅的绑定构建器
   - 支持链式调用
   - 支持条件绑定

4. **类型安全**:
   - 使用泛型和类型推断
   - 提供类型辅助函数
   - 编译时类型检查

## 5️⃣ IMPLEMENTATION GUIDANCE

### 5.1 装饰器实现

**@bind 装饰器**:
```typescript
/**
 * 数据绑定装饰器
 */
export function bind(
    path: string,
    options?: {
        target?: string;
        property?: string;
        componentType?: string;
        mode?: 'one-way' | 'two-way';
        converter?: (value: any) => any;
        reverseConverter?: (value: any) => any;
    }
) {
    return function (target: any, propertyKey: string) {
        // 存储绑定配置
        const bindings = target.__bindings__ || [];
        bindings.push({
            path,
            target: options?.target || propertyKey,
            property: options?.property,
            componentType: options?.componentType,
            mode: options?.mode || 'one-way',
            converter: options?.converter,
            reverseConverter: options?.reverseConverter
        });
        target.__bindings__ = bindings;
    };
}
```

**@on 装饰器**:
```typescript
/**
 * 事件绑定装饰器
 */
export function on(
    event: string,
    options?: {
        target?: string;
        handler?: string;
    }
) {
    return function (target: any, propertyKey: string) {
        const events = target.__events__ || [];
        events.push({
            event,
            target: options?.target || propertyKey,
            handler: options?.handler
        });
        target.__events__ = events;
    };
}
```

### 5.2 增强的 MVVMComponent

```typescript
@ccclass('MVVMComponent')
export abstract class MVVMComponent extends Component {
    protected viewModel!: ViewModel;
    protected viewAdapter!: CocosViewAdapter;
    
    // 自动处理装饰器配置
    onLoad() {
        // 创建模型
        const model = this.createModel();
        
        // 创建 ViewModel
        this.viewModel = this.initViewModel(model);
        
        // 创建适配器
        this.viewAdapter = this.createViewAdapter();
        
        // 处理装饰器绑定
        this.processDecoratorBindings();
        
        // 调用子类初始化
        this.onMVVMLoad();
    }
    
    /**
     * 处理装饰器绑定
     */
    private processDecoratorBindings(): void {
        const bindings = (this as any).__bindings__ || [];
        const events = (this as any).__events__ || [];
        const conditions = (this as any).__conditions__ || [];
        
        // 处理数据绑定
        bindings.forEach((binding: any) => {
            const target = this.getProperty(binding.target);
            if (target) {
                // 创建绑定映射
                // ...
                this.viewModel.bind(binding.path, this.viewAdapter, {
                    mode: binding.mode,
                    converter: binding.converter,
                    reverseConverter: binding.reverseConverter
                });
            }
        });
        
        // 处理事件绑定
        events.forEach((event: any) => {
            // ...
        });
        
        // 处理条件渲染
        conditions.forEach((condition: any) => {
            // ...
        });
    }
    
    /**
     * 子类可以重写此方法进行额外初始化
     */
    protected onMVVMLoad(): void {
        // 子类实现
    }
}
```

### 5.3 BindingBuilder 实现

```typescript
export class BindingBuilder {
    private component: MVVMComponent;
    private bindings: any[] = [];
    private events: any[] = [];
    
    constructor(component: MVVMComponent) {
        this.component = component;
    }
    
    /**
     * 添加数据绑定
     */
    bind(
        path: string,
        target: Node | Component | string,
        property?: string,
        options?: BindingOptions
    ): this {
        this.bindings.push({ path, target, property, options });
        return this;
    }
    
    /**
     * 添加事件绑定
     */
    on(
        event: string,
        target: Node | Component | string,
        handler: string | Function
    ): this {
        this.events.push({ event, target, handler });
        return this;
    }
    
    /**
     * 添加条件渲染
     */
    if(path: string, target: Node): this {
        // ...
        return this;
    }
    
    /**
     * 构建所有绑定
     */
    build(): void {
        // 处理所有绑定
        this.bindings.forEach(binding => {
            // ...
        });
        
        this.events.forEach(event => {
            // ...
        });
    }
}
```

### 5.4 使用示例

**装饰器方式**:
```typescript
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent {
    @property(Label)
    nameLabel: Label | null = null;
    
    @property(Label)
    levelLabel: Label | null = null;
    
    @bind('name', { target: 'nameLabel', property: 'string' })
    @bind('level', { target: 'levelLabel', property: 'string', converter: (v) => `Lv.${v}` })
    private viewModel!: ViewModel;
    
    protected initViewModel(model: Model): ViewModel {
        return new ViewModel(model);
    }
    
    protected createModel(): Model {
        return new Model({ name: 'Player', level: 1 });
    }
}
```

**构建器方式**:
```typescript
@ccclass('PlayerInfo')
export class PlayerInfo extends MVVMComponent {
    @property(Label)
    nameLabel: Label | null = null;
    
    onLoad() {
        super.onLoad();
        
        this.bindingBuilder
            .bind('name', this.nameLabel, 'string')
            .bind('level', this.levelLabel, 'string', { converter: (v) => `Lv.${v}` })
            .on('click', this.levelUpButton, this.onLevelUp)
            .build();
    }
}
```

## 6️⃣ VERIFICATION

VERIFICATION:
- [x] 问题 clearly defined
- [x] Multiple options considered
- [x] Decision made with rationale
- [x] Implementation guidance provided
- [x] 考虑了向后兼容性
- [x] 考虑了类型安全
- [x] 考虑了易用性
- [x] 考虑了性能

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CREATIVE PHASE END

