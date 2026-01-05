# PLAN 检查点报告 - MVVM-CREATOR-006

## 任务信息
- **任务ID**: MVVM-CREATOR-006
- **任务名称**: mvvm-creator 装饰器/绑定声明语法糖（减少模板代码）
- **复杂度**: Level 3 - Intermediate Feature
- **创建时间**: 2025-01-XX
- **PLAN 模式开始时间**: 2025-01-XX

---

## 📋 任务概述

**目标**：为 `@bl-framework/mvvm-creator` 添加装饰器/绑定声明语法糖，减少模板代码，提高开发效率。

**当前问题**：
- 需要手动调用 `bindingBuilder.bind()` 多次
- 需要手动导入 ViewTarget 辅助函数
- 代码重复性较高
- 对于简单绑定，代码量较多

---

## 🎯 核心需求分析

### 功能需求

1. **减少模板代码**（高优先级）
   - 提供更简洁的绑定声明方式
   - 减少重复的 `bindingBuilder.bind()` 调用
   - 减少显式的 ViewTarget 辅助函数导入

2. **保持类型安全**（高优先级）
   - 语法糖不能牺牲现有的类型安全特性
   - 路径类型自动推断
   - 值类型自动推断

3. **向后兼容**（高优先级）
   - 现有 BindingBuilder API 必须继续工作
   - 现有使用方式不受影响
   - 新语法糖是可选的

4. **易于使用**（中优先级）
   - 降低学习曲线
   - 提供清晰的文档和示例
   - 支持简单和复杂场景

### 非功能需求

1. **性能**：语法糖不应引入明显的性能开销
2. **可维护性**：代码清晰，易于理解和维护
3. **可扩展性**：支持未来扩展

---

## 🔍 方案分析

### 方案 1: 属性装饰器（@bindProperty）

**思路**：在 `@property` 装饰的属性上添加 `@bindProperty` 装饰器，自动创建绑定。

**优点**：
- 最简洁，代码量最少
- 声明式，易于理解
- 与 Cocos Creator 的 `@property` 风格一致

**缺点**：
- TypeScript 装饰器限制（需要 experimentalDecorators）
- 类型推断可能受限
- 复杂绑定（格式化、转换器）支持困难
- 需要修改 MVVMComponent 的初始化逻辑

**示例**：
```typescript
@ccclass('PlayerComponent')
export class PlayerComponent extends MVVMComponent<PlayerData> {
    @property(Label)
    @bindProperty('name')  // 自动绑定到 'name' 路径
    nameLabel!: Label;
    
    @property(Label)
    @bindProperty('level', { converter: (v: number) => `Lv.${v}` })
    levelLabel!: Label;
}
```

### 方案 2: 配置式绑定（bindConfig）

**思路**：使用配置对象声明绑定，在 `onMVVMCreate()` 中调用 `bindConfig()`。

**优点**：
- 类型安全（配置对象可以类型化）
- 支持复杂绑定（格式化、转换器）
- 不需要装饰器支持
- 易于理解和维护

**缺点**：
- 仍然需要显式调用
- 代码量减少有限

**示例**：
```typescript
protected onMVVMCreate(): void {
    this.bindingBuilder.bindConfig({
        name: { target: this.nameLabel, helper: 'toLabelText' },
        level: { 
            target: this.levelLabel, 
            helper: 'toLabelFmt',
            formatter: (v: number) => `Lv.${v}`
        },
        playerName: { 
            target: this.nameInput, 
            helper: 'toEditBox',
            mode: 'two-way'
        }
    });
}
```

### 方案 3: 智能属性推断（推荐）

**思路**：在 `onMVVMCreate()` 中，通过属性名自动推断绑定规则，使用约定优于配置。

**优点**：
- 不需要装饰器
- 类型安全
- 代码简洁
- 支持复杂绑定

**缺点**：
- 需要命名约定
- 灵活性可能受限

**示例**：
```typescript
protected onMVVMCreate(): void {
    // 自动推断：nameLabel -> 'name' + toLabelText
    // 自动推断：levelLabel -> 'level' + toLabelFmt
    this.bindingBuilder.autoBind(this);
}
```

### 方案 4: 混合方案（推荐）

**思路**：结合方案 1 和方案 2，提供装饰器和配置式两种方式。

**优点**：
- 灵活性高
- 简单场景用装饰器，复杂场景用配置
- 向后兼容

**缺点**：
- 实现复杂度较高
- 需要维护两套 API

---

## 🏗️ 架构设计

### 推荐方案：混合方案（装饰器 + 配置式）

**核心组件**：

1. **@bindProperty 装饰器**
   - 存储绑定元数据到类原型
   - 在 MVVMComponent 初始化时自动应用

2. **bindConfig 方法**
   - 扩展 BindingBuilder，添加 `bindConfig()` 方法
   - 支持配置对象批量绑定

3. **MVVMComponent 增强**
   - 在 `_createIfNeeded()` 中扫描装饰器元数据
   - 自动应用装饰器绑定的配置

### 技术栈

- **TypeScript**: 5.0+（需要 experimentalDecorators）
- **装饰器元数据**: 使用 WeakMap 存储
- **类型推断**: 利用 TypeScript 泛型和模板字面量类型

---

## 📊 复杂度最终评估

### 复杂度级别：Level 3 - Intermediate Feature

**理由**：
- 需要设计新的装饰器系统
- 需要与现有的 BindingBuilder 集成
- 需要保持类型安全
- 需要修改 MVVMComponent
- 影响范围：mvvm-creator 包
- 需要 CREATIVE 模式设计装饰器 API

**预计时间**：8-12 小时

---

## 🔄 分阶段实施计划

### 阶段 1: 技术验证和设计（2-3 小时）

**目标**：验证 TypeScript 装饰器支持，设计装饰器 API

**任务**：
- [ ] 检查并配置 TypeScript 装饰器支持（experimentalDecorators）
- [ ] 创建装饰器元数据存储机制
- [ ] 设计 `@bindProperty` 装饰器 API
- [ ] 设计 `bindConfig` 方法 API
- [ ] 创建 POC（概念验证）

**输出**：
- 技术验证报告
- 装饰器 API 设计文档（CREATIVE 模式）

### 阶段 2: 实现装饰器系统（2-3 小时）

**目标**：实现 `@bindProperty` 装饰器和元数据管理

**任务**：
- [ ] 实现装饰器元数据存储（WeakMap）
- [ ] 实现 `@bindProperty` 装饰器
- [ ] 实现装饰器元数据读取工具
- [ ] 单元测试

**输出**：
- `packages/mvvm-creator/src/decorators/bind-property.ts`
- `packages/mvvm-creator/src/decorators/metadata.ts`
- 单元测试

### 阶段 3: 实现配置式绑定（2-3 小时）

**目标**：扩展 BindingBuilder，添加 `bindConfig()` 方法

**任务**：
- [ ] 设计配置对象类型
- [ ] 实现 `bindConfig()` 方法
- [ ] 实现配置到 ViewTarget 的转换
- [ ] 单元测试

**输出**：
- `BindingBuilder.bindConfig()` 方法
- 配置类型定义
- 单元测试

### 阶段 4: 集成到 MVVMComponent（2-3 小时）

**目标**：修改 MVVMComponent，支持装饰器自动绑定

**任务**：
- [ ] 修改 `_createIfNeeded()` 扫描装饰器元数据
- [ ] 实现装饰器绑定自动应用
- [ ] 确保与现有 API 兼容
- [ ] 集成测试

**输出**：
- 更新的 `MVVMComponent.ts`
- 集成测试
- 示例代码

### 阶段 5: 文档和示例（1-2 小时）

**目标**：更新文档，创建示例

**任务**：
- [ ] 更新 README.md
- [ ] 创建装饰器使用示例
- [ ] 创建配置式绑定示例
- [ ] 更新 API 文档

**输出**：
- 更新的 README.md
- 示例文件
- API 文档

---

## 🎨 CREATIVE 模式需求

### 需要 CREATIVE 模式设计的组件

1. **@bindProperty 装饰器 API 设计**
   - 装饰器参数设计
   - 类型安全实现
   - 元数据存储机制
   - 与现有 API 的集成方式

2. **bindConfig 配置对象设计**
   - 配置对象结构
   - 类型定义
   - 辅助函数映射机制
   - 复杂绑定支持

3. **MVVMComponent 集成设计**
   - 装饰器扫描时机
   - 元数据应用方式
   - 与现有 `onMVVMCreate()` 的兼容性

---

## ⚠️ 风险和挑战

### 技术风险

1. **TypeScript 装饰器限制**
   - **风险**：装饰器元数据访问受限
   - **缓解**：使用 WeakMap 存储元数据，在运行时访问

2. **类型安全**
   - **风险**：装饰器可能难以保持完整的类型安全
   - **缓解**：使用泛型和类型推断，提供类型工具

3. **性能影响**
   - **风险**：装饰器扫描可能影响初始化性能
   - **缓解**：缓存扫描结果，只在首次初始化时扫描

### 设计风险

1. **API 复杂度**
   - **风险**：两套 API 可能增加学习曲线
   - **缓解**：提供清晰的文档和示例，推荐使用场景

2. **向后兼容**
   - **风险**：新功能可能破坏现有代码
   - **缓解**：新功能完全可选，现有 API 保持不变

---

## ✅ 验收标准

### 功能验收

1. **装饰器功能**
   - [ ] `@bindProperty` 装饰器可以正确声明绑定
   - [ ] 装饰器绑定的属性在组件初始化时自动绑定
   - [ ] 支持简单绑定（Label, EditBox 等）
   - [ ] 支持复杂绑定（格式化、转换器）

2. **配置式绑定**
   - [ ] `bindConfig()` 方法可以批量声明绑定
   - [ ] 配置对象类型安全
   - [ ] 支持所有 ViewTarget 辅助函数

3. **向后兼容**
   - [ ] 现有的 `bindingBuilder.bind()` API 继续工作
   - [ ] 现有的使用方式不受影响
   - [ ] 新功能是可选的

### 质量验收

1. **类型安全**
   - [ ] 路径类型自动推断
   - [ ] 值类型自动推断
   - [ ] 编译时类型检查

2. **性能**
   - [ ] 初始化性能无明显下降
   - [ ] 运行时性能无影响

3. **文档**
   - [ ] README 更新完整
   - [ ] 示例代码清晰
   - [ ] API 文档完整

---

## 📋 技术验证检查清单

- [ ] TypeScript 装饰器支持配置（experimentalDecorators）
- [ ] 装饰器元数据存储机制验证
- [ ] 类型推断功能验证
- [ ] 与现有 API 兼容性验证
- [ ] 构建配置验证

---

## 🎯 下一步行动

1. **进入 CREATIVE 模式**（推荐）
   - 设计 `@bindProperty` 装饰器 API
   - 设计 `bindConfig` 配置对象结构
   - 设计 MVVMComponent 集成方式

2. **或直接进入 BUILD 模式**
   - 如果设计清晰，可以直接实现
   - 在实现过程中遇到问题再进入 CREATIVE 模式

---

**PLAN 模式完成时间**: 2025-01-XX  
**状态**: ✅ **COMPLETE**  
**下一步**: 进入 CREATIVE 模式（推荐）或 BUILD 模式

