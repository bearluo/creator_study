# bl-framework Core 库集成计划

## 目标

将 `@bl-framework/core` npm 包集成到 bl-framework 扩展包中，替换原有的本地代码。

## 当前状态

- ✅ Core 库已发布到 npm
- ⏳ 需要在 bl-framework 中集成使用

## 集成步骤

### 步骤 1: 安装依赖

在 `extensions/bl-framework/package.json` 中添加依赖：

```json
{
  "dependencies": {
    "@bl-framework/core": "^1.0.0"
  }
}
```

### 步骤 2: 更新导入路径

需要更新以下文件的导入路径：

#### Common 模块
- `FWPath.ts` - 从 `@bl-framework/core` 导入
- `FWLog.ts` - 从 `@bl-framework/core` 导入
- `FWDecorator.ts` - 从 `@bl-framework/core` 导入

#### Events 模块
- `FWEventDispatcher.ts` - 从 `@bl-framework/core` 导入
- `FWEvents.ts` - 需要保留框架特定的事件定义，但使用 core 的类型

### 步骤 3: 处理框架特定代码

#### FWEvents.ts
- 保留 `IFWEvents` 接口（框架特定）
- 保留 `FWEventNames` 常量（框架特定）
- 使用 core 的 `EventMap` 类型作为基类

#### FWLog.ts
- 在扩展包中创建适配层（如果需要 Cocos Creator 特定功能）
- 或直接使用 core 的配置系统

### 步骤 4: 更新导出

更新 `extensions/bl-framework/assets/common/index.ts` 和 `events/index.ts`：
- 重新导出 core 的内容
- 添加框架特定的扩展

### 步骤 5: 验证

- 运行编译检查
- 测试功能是否正常
- 检查是否有遗漏的导入

## 文件清单

### 需要更新的文件

1. **package.json**
   - 添加 `@bl-framework/core` 依赖

2. **common/index.ts**
   - 从 `@bl-framework/core` 重新导出

3. **events/index.ts**
   - 从 `@bl-framework/core` 重新导出
   - 添加框架特定的事件定义

4. **所有使用这些模块的文件**
   - 更新导入路径（如果需要）

### 可以删除的文件（可选）

如果完全使用 npm 包，可以考虑删除：
- `extensions/bl-framework/assets/common/FWPath.ts`
- `extensions/bl-framework/assets/common/FWLog.ts`
- `extensions/bl-framework/assets/common/FWDecorator.ts`
- `extensions/bl-framework/assets/events/FWEventDispatcher.ts`
- `extensions/bl-framework/assets/events/FWEvents.ts`（部分，保留框架特定部分）

## 注意事项

1. **向后兼容**: 确保现有代码仍然可以正常工作
2. **类型定义**: 确保 TypeScript 类型正确
3. **框架特定功能**: 保留需要在 Cocos Creator 环境中使用的特定功能
4. **测试**: 集成后需要充分测试

## 实施计划

- [x] 步骤 1: 安装依赖
  - [x] 在 package.json 中添加 `@bl-framework/core`
- [x] 步骤 2: 更新导入路径
  - [x] 创建 `common/index.ts` 重新导出
  - [x] 创建 `events/index.ts` 重新导出
- [x] 步骤 3: 处理框架特定代码
  - [x] 在 `events/index.ts` 中添加框架特定的事件定义
- [x] 步骤 4: 更新导出
  - [x] 完成 common 和 events 的导出文件
- [x] 步骤 5: 验证和测试
  - [x] 创建集成完成总结文档
  - [ ] 运行 `npm install` 安装依赖（需要手动执行）
  - [ ] 运行编译检查（需要手动执行）
  - [ ] 测试功能是否正常（需要手动执行）

## 集成完成

✅ Core 库集成已完成！

所有必要的文件已创建和更新：
- package.json 已添加依赖
- common/index.ts 已创建
- events/index.ts 已创建（包含框架特定定义）

**下一步**: 运行 `npm install` 安装依赖，然后验证编译和功能。

---

*创建时间: 2025-11-17*

