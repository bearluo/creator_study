# 🎨 CREATIVE: MVVM-Creator 类型安全 API 设计

## 任务信息
- **任务ID**: MVVM-CREATOR-003-CREATIVE
- **CREATIVE 类型**: Architecture Design / Type System Design / API Design
- **创建日期**: 2025-01-XX
- **设计者**: AI Assistant

---

## 🎯 问题陈述

### 当前问题

MVVM-Creator 的 `BindingBuilder` 使用字符串路径，无法利用新的 MVVM 框架类型安全功能：

```typescript
interface PlayerData {
    name: string;
    stats: { health: number; level: number };
    items: Array<{ id: string; name: string }>;
}

// 当前实现（无类型安全）
const builder = new BindingBuilder(viewModel, node);
builder.bind('name', label);              // ✅ 正确，但无类型检查
builder.bind('stats.health', label);      // ✅ 正确，但无类型检查
builder.bind('stats.hp', label);          // ❌ 应该报错但没有
builder.bind('nam', label);               // ❌ 应该报错但没有
```

**核心问题**：
1. `BindingBuilder` 不是泛型类，无法传递数据类型信息
2. `bind()` 方法使用 `string` 类型，无类型检查
3. 无法利用 `Path<T>` 和 `PathValue<T, P>` 类型工具
4. 转换器和验证器无法自动推断类型
5. 未使用新的 `bindMany()` 和 `bindConfig()` 方法

### 设计目标

1. **类型安全**：`BindingBuilder` 支持类型安全的路径绑定
2. **IDE 支持**：提供路径自动补全和类型推断
3. **批量绑定**：利用新的 `bindMany()` 和 `bindConfig()` 方法
4. **错误处理**：集成新的错误处理机制
5. **开发体验**：简化 API，提高开发效率

---

## 🔍 技术背景

### 新的 MVVM 框架功能

**类型工具**：
- `Path<T>` - 递归路径类型工具，支持嵌套对象和数组路径
- `PathValue<T, P>` - 路径值类型工具，自动推断路径对应的值类型

**批量绑定 API**：
- `ViewModel.bindMany<P>()` - 批量绑定方法
- `ViewModel.bindConfig()` - 声明式绑定配置

**错误处理**：
- `ValidationError` - 验证错误
- `PathError` - 路径错误
- `onError` 回调机制

### 当前 BindingBuilder 结构

```typescript
export class BindingBuilder {
    private viewModel: ViewModel;  // ❌ 无泛型类型
    private bindings: Array<{
        path: string;              // ❌ 无类型约束
        target: CocosNode | CocosComponent | string;
        property?: string;
        componentType?: string;
        options?: BindingOptions;  // ❌ 无类型推断
    }> = [];
    
    bind(
        path: string,              // ❌ 无类型约束
        target: CocosNode | CocosComponent | string,
        property?: string,
        options?: BindingOptions   // ❌ 无类型推断
    ): this {
        // ...
    }
}
```

---

## 🎨 设计方案探索

### 方案 1: 简单泛型化（最小改动）

#### 描述
将 `BindingBuilder` 改为泛型类，`bind()` 方法使用 `Path<T>` 类型约束。

#### 实现

```typescript
export class BindingBuilder<T> {
    private viewModel: ViewModel<T>;
    private bindings: Array<{
        path: Path<T> & string;
        target: CocosNode | CocosComponent | string;
        property?: string;
        componentType?: string;
        options?: BindingOptions<PathValue<T, Path<T> & string>>;
    }> = [];
    
    constructor(viewModel: ViewModel<T>, rootNode: CocosNode, viewAdapter?: CocosViewAdapter, componentInstance?: any) {
        this.viewModel = viewModel;
        // ...
    }
    
    bind<P extends Path<T> & string>(
        path: P,
        target: CocosNode | CocosComponent | string,
        property?: string,
        options?: BindingOptions<PathValue<T, P>>
    ): this {
        this.bindings.push({
            path,
            target,
            property,
            componentType: property ? this._inferComponentType(target) : undefined,
            options
        });
        return this;
    }
    
    build(): void {
        // 逐个绑定（保持现有逻辑）
        this.bindings.forEach(binding => {
            this.viewModel.bind(binding.path, this.viewAdapter!, binding.options);
        });
    }
}
```

#### 优点
- ✅ 实现简单，改动最小
- ✅ 类型安全，支持 IDE 自动补全
- ✅ 转换器和验证器自动推断类型
- ✅ 向后兼容性好（如果保持现有 API）

#### 缺点
- ❌ 未使用批量绑定 API，性能可能不如批量绑定
- ❌ 仍然逐个创建绑定，未充分利用新 API

#### 技术评估
- **类型安全**: ⭐⭐⭐⭐⭐ (5/5)
- **性能**: ⭐⭐⭐ (3/5)
- **易用性**: ⭐⭐⭐⭐ (4/5)
- **实现复杂度**: ⭐⭐ (2/5) - 简单

---

### 方案 2: 批量绑定集成（推荐）

#### 描述
在方案 1 的基础上，使用 `bindMany()` 批量创建绑定。

#### 实现

```typescript
export class BindingBuilder<T> {
    private viewModel: ViewModel<T>;
    private viewAdapter?: CocosViewAdapter;
    private bindings: Array<{
        path: Path<T> & string;
        target: CocosNode | CocosComponent | string;
        property?: string;
        componentType?: string;
        options?: BindingOptions<PathValue<T, Path<T> & string>>;
    }> = [];
    // ... 其他属性
    
    bind<P extends Path<T> & string>(
        path: P,
        target: CocosNode | CocosComponent | string,
        property?: string,
        options?: BindingOptions<PathValue<T, P>>
    ): this {
        this.bindings.push({
            path,
            target,
            property,
            componentType: property ? this._inferComponentType(target) : undefined,
            options
        });
        return this;
    }
    
    build(): void {
        // 确保视图适配器存在
        if (!this.viewAdapter) {
            this.viewAdapter = new CocosViewAdapter({
                rootNode: this.rootNode
            });
        }
        
        // 处理视图适配器映射
        this.bindings.forEach(binding => {
            if (typeof binding.target === 'string') {
                this.viewAdapter!.addMapping({
                    path: binding.target,
                    viewPath: binding.path,
                    componentType: binding.componentType,
                    propertyName: binding.property
                });
            }
        });
        
        // 使用批量绑定 API
        const bindingsConfig: Partial<Record<Path<T> & string, BatchBindingItem<T, Path<T> & string>>> = {};
        this.bindings.forEach(binding => {
            bindingsConfig[binding.path] = {
                view: this.viewAdapter!,
                options: binding.options
            };
        });
        
        // 批量创建绑定
        this.viewModel.bindMany(bindingsConfig as Record<Path<T> & string, BatchBindingItem<T, Path<T> & string>>);
        
        // 处理事件、条件、列表等（保持现有逻辑）
        // ...
    }
}
```

#### 优点
- ✅ 类型安全，支持 IDE 自动补全
- ✅ 使用批量绑定 API，性能更好
- ✅ 转换器和验证器自动推断类型
- ✅ 充分利用新的 MVVM 框架功能

#### 缺点
- ⚠️ 需要处理类型转换（`Partial<Record<...>>` 到 `Record<...>`）
- ⚠️ 实现稍微复杂一些

#### 技术评估
- **类型安全**: ⭐⭐⭐⭐⭐ (5/5)
- **性能**: ⭐⭐⭐⭐⭐ (5/5)
- **易用性**: ⭐⭐⭐⭐ (4/5)
- **实现复杂度**: ⭐⭐⭐ (3/5) - 中等

---

### 方案 3: 声明式配置（最灵活）

#### 描述
在方案 2 的基础上，添加 `bindConfig()` 方法支持，提供声明式配置。

#### 实现

```typescript
export class BindingBuilder<T> {
    // ... 同方案 2
    
    /**
     * 声明式绑定配置
     */
    config<P extends Path<T> & string>(
        bindings: Record<P, {
            target: CocosNode | CocosComponent | string;
            property?: string;
            componentType?: string;
            options?: BindingOptions<PathValue<T, P>>;
        }>
    ): this {
        // 收集配置
        Object.entries(bindings).forEach(([path, config]) => {
            this.bind(
                path as P,
                config.target,
                config.property,
                config.options
            );
        });
        return this;
    }
    
    /**
     * 使用 bindConfig() 批量创建绑定
     */
    buildWithConfig(): Map<string, DataBinding<T, any>> {
        if (!this.viewAdapter) {
            this.viewAdapter = new CocosViewAdapter({
                rootNode: this.rootNode
            });
        }
        
        // 处理视图适配器映射
        this.bindings.forEach(binding => {
            if (typeof binding.target === 'string') {
                this.viewAdapter!.addMapping({
                    path: binding.target,
                    viewPath: binding.path,
                    componentType: binding.componentType,
                    propertyName: binding.property
                });
            }
        });
        
        // 构建绑定配置
        const config: BindingConfig<T> = {
            view: this.viewAdapter,
            bindings: {}
        };
        
        this.bindings.forEach(binding => {
            (config.bindings as any)[binding.path] = binding.options;
        });
        
        // 使用 bindConfig() 创建绑定
        return this.viewModel.bindConfig(config);
    }
}
```

#### 优点
- ✅ 类型安全，支持 IDE 自动补全
- ✅ 支持声明式配置，更灵活
- ✅ 使用批量绑定 API，性能好
- ✅ 提供多种使用方式

#### 缺点
- ⚠️ API 更复杂，学习曲线稍高
- ⚠️ 需要维护两种构建方式（`build()` 和 `buildWithConfig()`）

#### 技术评估
- **类型安全**: ⭐⭐⭐⭐⭐ (5/5)
- **性能**: ⭐⭐⭐⭐⭐ (5/5)
- **易用性**: ⭐⭐⭐ (3/5) - API 较复杂
- **实现复杂度**: ⭐⭐⭐⭐ (4/5) - 较复杂

---

### 方案 4: 混合方案（推荐 - 最佳平衡）

#### 描述
结合方案 2 和方案 3 的优点，提供灵活的 API，同时保持简单易用。

#### 实现

```typescript
export class BindingBuilder<T> {
    private viewModel: ViewModel<T>;
    private viewAdapter?: CocosViewAdapter;
    private bindings: Array<{
        path: Path<T> & string;
        target: CocosNode | CocosComponent | string;
        property?: string;
        componentType?: string;
        options?: BindingOptions<PathValue<T, Path<T> & string>>;
    }> = [];
    private events: Array<{ /* ... */ }> = [];
    private conditions: Array<{ /* ... */ }> = [];
    private lists: Array<{ /* ... */ }> = [];
    private rootNode: CocosNode;
    private componentInstance?: any;
    
    constructor(viewModel: ViewModel<T>, rootNode: CocosNode, viewAdapter?: CocosViewAdapter, componentInstance?: any) {
        this.viewModel = viewModel;
        this.rootNode = rootNode;
        this.viewAdapter = viewAdapter;
        this.componentInstance = componentInstance;
    }
    
    /**
     * 类型安全的绑定方法
     */
    bind<P extends Path<T> & string>(
        path: P,
        target: CocosNode | CocosComponent | string,
        property?: string,
        options?: BindingOptions<PathValue<T, P>>
    ): this {
        this.bindings.push({
            path,
            target,
            property,
            componentType: property ? this._inferComponentType(target) : undefined,
            options
        });
        return this;
    }
    
    /**
     * 批量绑定方法（使用 bindMany）
     */
    bindMany<P extends Path<T> & string>(
        bindings: Record<P, {
            target: CocosNode | CocosComponent | string;
            property?: string;
            componentType?: string;
            options?: BindingOptions<PathValue<T, P>>;
        }>
    ): this {
        Object.entries(bindings).forEach(([path, config]) => {
            this.bind(
                path as P,
                config.target,
                config.property,
                config.options
            );
        });
        return this;
    }
    
    /**
     * 构建所有绑定（使用批量绑定 API）
     */
    build(): void {
        // 确保视图适配器存在
        if (!this.viewAdapter) {
            this.viewAdapter = new CocosViewAdapter({
                rootNode: this.rootNode
            });
        }
        
        // 处理视图适配器映射
        this.bindings.forEach(binding => {
            if (typeof binding.target === 'string') {
                this.viewAdapter!.addMapping({
                    path: binding.target,
                    viewPath: binding.path,
                    componentType: binding.componentType,
                    propertyName: binding.property
                });
            }
        });
        
        // 使用批量绑定 API
        if (this.bindings.length > 0) {
            const bindingsConfig: Partial<Record<Path<T> & string, BatchBindingItem<T, Path<T> & string>>> = {};
            this.bindings.forEach(binding => {
                bindingsConfig[binding.path] = {
                    view: this.viewAdapter!,
                    options: binding.options
                };
            });
            
            // 批量创建绑定
            this.viewModel.bindMany(
                bindingsConfig as Record<Path<T> & string, BatchBindingItem<T, Path<T> & string>>
            );
        }
        
        // 处理事件、条件、列表等（保持现有逻辑）
        this.events.forEach(event => {
            this._processEvent(event);
        });
        
        this.conditions.forEach(condition => {
            this._processCondition(condition);
        });
        
        this.lists.forEach(list => {
            this._processList(list);
        });
    }
    
    // ... 其他方法（on, if, for 等）
}
```

#### 优点
- ✅ 类型安全，支持 IDE 自动补全
- ✅ 使用批量绑定 API，性能好
- ✅ 提供链式 API，易于使用
- ✅ 支持批量绑定方法，更灵活
- ✅ 充分利用新的 MVVM 框架功能

#### 缺点
- ⚠️ 需要处理类型转换
- ⚠️ 实现稍微复杂一些

#### 技术评估
- **类型安全**: ⭐⭐⭐⭐⭐ (5/5)
- **性能**: ⭐⭐⭐⭐⭐ (5/5)
- **易用性**: ⭐⭐⭐⭐⭐ (5/5)
- **实现复杂度**: ⭐⭐⭐ (3/5) - 中等

---

## ⚖️ 方案对比

| 方案 | 类型安全 | 性能 | 易用性 | 实现复杂度 | 推荐度 |
|------|---------|------|--------|-----------|--------|
| 方案 1: 简单泛型化 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 方案 2: 批量绑定集成 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 方案 3: 声明式配置 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **方案 4: 混合方案** | **⭐⭐⭐⭐⭐** | **⭐⭐⭐⭐⭐** | **⭐⭐⭐⭐⭐** | **⭐⭐⭐** | **⭐⭐⭐⭐⭐** |

---

## ✅ 推荐方案：方案 4 - 混合方案

### 选择理由

1. **最佳平衡**：在类型安全、性能、易用性和实现复杂度之间取得最佳平衡
2. **充分利用新功能**：使用 `bindMany()` 批量绑定 API，性能更好
3. **灵活的使用方式**：支持链式 API 和批量绑定方法
4. **类型安全完整**：完整的类型推断和 IDE 支持
5. **易于迁移**：API 设计清晰，易于理解和迁移

### 核心设计决策

1. **泛型类设计**：`BindingBuilder<T>` 传递数据类型信息
2. **类型安全绑定**：`bind<P extends Path<T> & string>()` 使用类型约束
3. **批量绑定集成**：`build()` 方法使用 `bindMany()` 批量创建绑定
4. **批量绑定方法**：提供 `bindMany()` 方法支持批量配置
5. **错误处理集成**：在 `BindingOptions` 中支持 `onError` 回调

---

## 📝 实施指南

### 步骤 1: 重构 BindingBuilder 为泛型类

```typescript
// 修改类定义
export class BindingBuilder<T> {
    private viewModel: ViewModel<T>;
    // ...
}
```

### 步骤 2: 实现类型安全的 bind() 方法

```typescript
bind<P extends Path<T> & string>(
    path: P,
    target: CocosNode | CocosComponent | string,
    property?: string,
    options?: BindingOptions<PathValue<T, P>>
): this {
    // ...
}
```

### 步骤 3: 实现批量绑定方法

```typescript
bindMany<P extends Path<T> & string>(
    bindings: Record<P, {
        target: CocosNode | CocosComponent | string;
        property?: string;
        componentType?: string;
        options?: BindingOptions<PathValue<T, P>>;
    }>
): this {
    // ...
}
```

### 步骤 4: 更新 build() 方法使用批量绑定

```typescript
build(): void {
    // 使用 bindMany() 批量创建绑定
    // ...
}
```

### 步骤 5: 更新 MVVMComponent 传递类型

```typescript
// MVVMComponent<T> 中
this.bindingBuilder = new BindingBuilder<T>(this.viewModel, this.node, this.viewAdapter, this);
```

---

## 🎯 使用示例

### 示例 1: 类型安全的链式绑定

```typescript
interface PlayerData {
    name: string;
    stats: { health: number; level: number };
    items: Array<{ id: string; name: string }>;
}

@ccclass('PlayerComponent')
export class PlayerComponent extends MVVMComponent<PlayerData> {
    @property(Label)
    nameLabel: Label | null = null;
    
    @property(Label)
    healthLabel: Label | null = null;
    
    onLoad() {
        super.onLoad();
        
        // 类型安全：IDE 自动补全，编译时检查
        this.bindingBuilder
            .bind('name', this.nameLabel, 'string')              // ✅
            .bind('stats.health', this.healthLabel, 'string', {  // ✅
                converter: (health) => `HP: ${health}`           // ✅ health: number（自动推断）
            })
            .build();
        
        // ❌ 类型错误：编译时检查
        // this.bindingBuilder.bind('nam', this.nameLabel);      // ❌ TypeScript 错误
        // this.bindingBuilder.bind('stats.hp', this.healthLabel); // ❌ TypeScript 错误
    }
}
```

### 示例 2: 批量绑定

```typescript
onLoad() {
    super.onLoad();
    
    // 批量绑定
    this.bindingBuilder.bindMany({
        name: {
            target: this.nameLabel,
            property: 'string',
            options: { mode: 'two-way' }
        },
        'stats.health': {
            target: this.healthLabel,
            property: 'string',
            options: {
                mode: 'one-way',
                converter: (health) => `HP: ${health}`  // ✅ health: number（自动推断）
            }
        }
    }).build();
}
```

### 示例 3: 错误处理

```typescript
this.bindingBuilder
    .bind('stats.health', this.healthLabel, 'string', {
        validator: (health) => health >= 0 && health <= 100,
        onError: (error, path, value) => {
            if (error instanceof ValidationError) {
                console.error(`验证失败: ${path} = ${value}`, error.message);
                // 错误恢复逻辑
            }
        }
    })
    .build();
```

---

## ⚠️ 注意事项

### 类型转换处理

由于 TypeScript 的类型系统限制，可能需要类型断言：

```typescript
// 在 build() 方法中
const bindingsConfig: Partial<Record<Path<T> & string, BatchBindingItem<T, Path<T> & string>>> = {};
// ...
this.viewModel.bindMany(
    bindingsConfig as Record<Path<T> & string, BatchBindingItem<T, Path<T> & string>>
);
```

### 视图适配器映射

需要确保在调用 `bindMany()` 之前，所有视图适配器映射都已设置：

```typescript
// 先处理映射
this.bindings.forEach(binding => {
    if (typeof binding.target === 'string') {
        this.viewAdapter!.addMapping({ /* ... */ });
    }
});

// 再批量创建绑定
this.viewModel.bindMany(bindingsConfig);
```

---

## ✅ 验收标准

### 功能验收
- ✅ `BindingBuilder<T>` 支持类型安全的路径绑定
- ✅ `bind()` 方法使用 `Path<T>` 类型约束
- ✅ 支持 `bindMany()` 批量绑定方法
- ✅ `build()` 方法使用 `bindMany()` 批量创建绑定
- ✅ 支持 `onError` 回调
- ✅ IDE 自动补全正常工作
- ✅ 编译时类型检查正常工作

### 性能验收
- ✅ 批量绑定性能提升（相比逐个绑定）
- ✅ 类型推断性能可接受

### 兼容性验收
- ✅ 新 API 功能完整
- ✅ 文档和示例更新

---

## 🎯 下一步行动

### CREATIVE 模式完成

**状态**: ✅ **COMPLETE**

所有设计决策已完成：
- ✅ 问题陈述和分析
- ✅ 技术背景研究
- ✅ 多个设计方案探索
- ✅ 方案对比和评估
- ✅ 推荐方案选择
- ✅ 实施指南
- ✅ 使用示例
- ✅ 验收标准

### 模式转换

根据 Level 3 工作流程，CREATIVE 模式完成后应进入 **VAN QA 模式**或**BUILD 模式**：

1. **进入 VAN QA 模式**（推荐）
   - 验证类型系统设计的可行性
   - 验证批量绑定 API 集成
   - 确保技术方案可行

2. **或直接进入 BUILD 模式**
   - 如果设计清晰，可以直接进入 BUILD 模式
   - 在实现过程中遇到问题再进入 VAN QA 模式

---

**CREATIVE 模式完成时间**: 2025-01-XX  
**设计状态**: ✅ **COMPLETE**  
**推荐方案**: 方案 4 - 混合方案  
**下一步**: 进入 VAN QA 模式验证技术可行性，或直接进入 BUILD 模式

