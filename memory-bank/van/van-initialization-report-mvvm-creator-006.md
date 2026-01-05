# VAN 初始化报告 - MVVM-CREATOR-006

## 任务信息
- **任务ID**: MVVM-CREATOR-006
- **任务名称**: mvvm-creator 装饰器/绑定声明语法糖（减少模板代码）
- **创建时间**: 2025-01-XX
- **复杂度**: 待评估

---

## 📋 任务描述

**目标**：为 `@bl-framework/mvvm-creator` 添加装饰器/绑定声明语法糖，减少模板代码，提高开发效率。

### 当前状态分析

**现有实现**（MVVM-CREATOR-005 完成）：
- `MVVMComponent` 基类：提供生命周期管理
- `BindingBuilder`：类型安全的绑定构建器
- `ViewTarget` 辅助函数：toLabelText, toEditBox, toProgress 等
- 使用方式：在 `onMVVMCreate()` 中手动调用 `bindingBuilder.bind()`

**当前使用方式示例**：
```typescript
protected onMVVMCreate(): void {
    this.bindingBuilder
        .bind('name', toLabelText(this.nameLabel))
        .bind('level', toLabelFmt(this.levelLabel, (v: number) => `Lv.${v}`))
        .bind('playerName', toEditBox(this.nameInput), { mode: 'two-way' })
        .bind('isDead', toActive(this.deadMask));
}
```

**问题**：
- 需要手动调用 `bindingBuilder.bind()` 多次
- 需要手动导入 ViewTarget 辅助函数
- 代码重复性较高
- 对于简单绑定，代码量较多

### 目标

1. **减少模板代码**：提供更简洁的绑定声明方式
2. **保持类型安全**：语法糖不能牺牲类型安全
3. **向后兼容**：不影响现有的 BindingBuilder API
4. **易于使用**：降低学习曲线，提高开发效率

---

## 🎯 需求分析

### 核心需求

1. **装饰器语法糖**（可选方案）
   - 提供 `@bind` 装饰器，简化绑定声明
   - 自动推断 ViewTarget 类型
   - 支持链式调用或批量声明

2. **属性绑定语法糖**（可选方案）
   - 基于 `@property` 装饰器自动绑定
   - 减少显式的 `bindingBuilder.bind()` 调用

3. **配置式绑定**（可选方案）
   - 使用配置对象声明绑定
   - 支持批量绑定配置

### 设计原则

1. **类型安全优先**：不能牺牲现有的类型安全特性
2. **向后兼容**：现有 API 必须继续工作
3. **简洁性**：减少代码量，提高可读性
4. **灵活性**：支持简单和复杂场景

---

## 📊 复杂度评估

### 初步评估：Level 2 - Simple Enhancement 或 Level 3 - Intermediate Feature

**理由**：
- 需要设计新的 API/装饰器系统
- 需要与现有的 BindingBuilder 集成
- 需要保持类型安全
- 可能需要修改 MVVMComponent
- 影响范围：mvvm-creator 包

**待确认**：
- 装饰器方案的具体实现复杂度
- TypeScript 装饰器的限制和兼容性
- 是否需要 CREATIVE 模式进行设计

**预计时间**：4-8 小时（Level 2）或 8-12 小时（Level 3）

---

## 🔍 技术验证

### 平台检测

- **操作系统**: Windows 10.0.26200
- **Shell**: PowerShell
- **路径分隔符**: `\`

### 依赖验证

- ✅ **@bl-framework/mvvm**: 1.0.0（已安装，本地链接）
- ⚠️ **TypeScript**: 需要检查装饰器支持（experimentalDecorators）
- ✅ **Cocos Creator**: 3.8+（@cocos/creator-types@3.8.7）

### 文件验证

- ✅ `packages/mvvm-creator/src/` 存在
- ✅ `packages/mvvm-creator/src/components/MVVMComponent.ts` 存在
- ✅ `packages/mvvm-creator/src/builders/BindingBuilder.ts` 存在
- ✅ `packages/mvvm-creator/src/helpers/view-targets.ts` 存在

### 构建配置验证

- ✅ `packages/mvvm-creator/tsconfig.json` 存在
- ✅ `packages/mvvm-creator/rollup.config.cjs` 存在

---

## 📋 下一步行动

### 复杂度确定后

**如果 Level 1**：
- 直接进入 BUILD 模式

**如果 Level 2-3**：
- 进入 PLAN 模式进行详细设计
- 可能需要 CREATIVE 模式设计装饰器 API

**如果 Level 4**：
- 进入 PLAN 模式
- 必须进入 CREATIVE 模式

---

## ✅ VAN 模式检查清单

- [x] Memory Bank 检查
- [x] 任务信息创建
- [x] 问题分析完成
- [x] 需求分析完成
- [x] 复杂度初步评估完成（待确认）
- [x] 平台检测完成（Windows PowerShell）
- [x] 文件验证完成
- [x] 依赖验证完成（@bl-framework/mvvm@1.0.0，TypeScript 装饰器支持待确认）
- [x] 构建配置验证完成
- [x] VAN 初始化报告创建

**VAN 模式状态**: ✅ **COMPLETE**（待复杂度确认）

---

**下一步**: 根据复杂度评估结果，进入 PLAN 模式或 BUILD 模式

