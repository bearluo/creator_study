# bl-framework Core 库规划

## 目标

创建一个独立的 npm 包 `@bl-framework/core`，包含 bl-framework 的核心基础功能。

## 核心模块分析

### 1. Common 模块（7 个文件）
- `FWConstant.ts` - 常量定义
- `FWDecorator.ts` - 装饰器工具
- `FWFile.ts` - 文件操作工具
- `FWFunction.ts` - 函数工具
- `FWLog.ts` - 日志工具
- `FWPath.ts` - 路径工具
- `FWTimer.ts` - 定时器工具

**评估**: 这些是通用工具，适合放入 core 库，但需要检查是否有 Cocos Creator 特定依赖。

### 2. Events 模块（2 个文件）
- `FWEventDispatcher.ts` - 事件分发器
- `FWEvents.ts` - 事件类型定义

**评估**: 事件系统是核心功能，适合放入 core 库。

### 3. Declare 模块（3 个文件）
- `bundle.d.ts` - Cocos Creator Bundle 类型扩展
- `FingerprintJS.d.ts` - FingerprintJS 类型定义
- `FWInterface.d.ts` - 框架接口定义

**评估**: 
- `bundle.d.ts` 是 Cocos Creator 特定，不应放入 core
- `FWInterface.d.ts` 如果是通用接口，可以放入
- `FingerprintJS.d.ts` 是第三方库类型，可以放入

### 4. ECS Core（8 个核心类）
- `Entity` - 实体
- `Component` - 组件基类
- `System` - 系统基类
- `World` - 世界
- `Query` - 查询
- `ComponentManager` - 组件管理器
- `EntityManager` - 实体管理器
- `SystemManager` - 系统管理器

**评估**: ECS 是一个完整的框架，应该作为独立的 npm 包 `@bl-framework/ecs`，而不是放入 core。

## Core 库范围定义（最终版）

### ✅ 第一阶段：可直接放入 core（无依赖）

1. **通用工具**
   - ✅ `FWPath.ts` - 路径工具（纯 TypeScript，无依赖）

2. **事件系统**（全部）
   - ✅ `FWEventDispatcher.ts` - 事件分发器（纯 TypeScript，无依赖）
   - ✅ `FWEvents.ts` - 事件类型定义（纯 TypeScript，无依赖）

### ⚠️ 第二阶段：处理后放入 core（需要移除依赖）

1. **FWLog.ts**
   - 当前依赖：`cc/env`, `cc`
   - 处理方案：移除 Cocos Creator 依赖，使用环境变量和原生 console

2. **FWDecorator.ts**
   - 当前依赖：`cc/Component`
   - 处理方案：移除 Cocos Creator 依赖，使用纯 TypeScript 装饰器

3. **FWFile.ts**（可选）
   - 当前依赖：`cc`, `crypto-es`
   - 处理方案：移除 Cocos Creator 依赖，保留 `crypto-es`（作为依赖）

### ❌ 不适合放入 core（保留在扩展包）

1. **FWConstant.ts** - 大量依赖 Cocos Creator 类型
2. **FWFunction.ts** - 大量依赖 Cocos Creator 功能
3. **FWTimer.ts** - 依赖 Cocos Creator 调度系统

### 需要处理的文件

以下文件需要移除或替换 Cocos Creator 依赖后才能放入 core：

1. **FWLog.ts**
   - 移除 `cc/env`，使用环境变量或配置
   - 移除 `cc` Node，使用原生 console

2. **FWTimer.ts**
   - 方案 A: 移除，使用原生 `setTimeout`/`setInterval`
   - 方案 B: 创建抽象接口，在扩展包中提供 Cocos Creator 实现

3. **FWFunction.ts**
   - 大量依赖 Cocos Creator，不适合放入 core
   - 建议：保留在扩展包中，或拆分为独立的功能模块

4. **FWFile.ts**
   - 依赖 Cocos Creator (`cc`) 和 `crypto-es`
   - 方案：移除 Cocos Creator 依赖，使用原生 API 或 Node.js API

5. **FWDecorator.ts**
   - 依赖 Cocos Creator (`cc/Component`)
   - 方案：移除 Cocos Creator 依赖，使用纯 TypeScript 装饰器

6. **FWConstant.ts**
   - 依赖 Cocos Creator (`cc` 的各种类型：Vec2, Vec3, Prefab, SpriteFrame 等)
   - 方案：不适合放入 core，保留在扩展包中

### 不应该包含

1. **ECS 框架** - 应该作为独立包 `@bl-framework/ecs`
2. **行为树** - 应该作为独立包 `@bl-framework/behaviortree`
3. **Cocos Creator 特定功能** - 保留在扩展包中
4. **业务逻辑** - 保留在扩展包中

## npm 包结构规划

### 包名
- `@bl-framework/core`

### 目录结构（第一阶段）
```
@bl-framework/core/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts              # 主入口
│   ├── common/               # 通用工具
│   │   ├── index.ts
│   │   └── FWPath.ts         # 路径工具
│   ├── events/               # 事件系统
│   │   ├── index.ts
│   │   ├── FWEventDispatcher.ts
│   │   └── FWEvents.ts
│   └── types/                # 类型定义（可选）
│       └── index.ts
├── dist/                     # 编译输出
│   ├── index.js
│   ├── index.d.ts
│   └── ...
└── tests/                    # 测试
    └── ...
```

### 目录结构（第二阶段，添加处理后文件）
```
@bl-framework/core/
├── src/
│   ├── common/
│   │   ├── FWPath.ts
│   │   ├── FWLog.ts          # 处理后（移除 cc 依赖）
│   │   └── FWDecorator.ts    # 处理后（移除 cc 依赖）
│   ├── events/
│   │   └── ...
│   └── ...
```

### package.json 配置

```json
{
  "name": "@bl-framework/core",
  "version": "1.0.0",
  "description": "bl-framework core utilities and event system",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test": "jest"
  },
  "keywords": [
    "bl-framework",
    "core",
    "utilities",
    "events"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^18.0.0"
  }
}
```

## 实施步骤

### 阶段 1: 准备工作 ✅
- [x] 检查 Common 模块是否有 Cocos Creator 依赖
- [x] 检查 Events 模块是否有 Cocos Creator 依赖
- [x] 确定需要移除或替换的依赖
- [x] 确定第一阶段可迁移的文件

### 阶段 2: 创建 npm 包结构（第一阶段）✅
- [x] 创建 `packages/core` 目录
- [x] 初始化 npm 包（package.json）
- [x] 配置 TypeScript
- [x] 创建目录结构
- [x] 创建 README.md

### 阶段 3: 迁移代码（第一阶段）✅
- [x] 迁移 `FWPath.ts`
- [x] 迁移 `FWEventDispatcher.ts`
- [x] 迁移 `FWEvents.ts`
- [x] 创建主入口文件
- [x] 创建模块入口文件

### 阶段 4: 处理依赖（第二阶段）
- [ ] 处理 `FWLog.ts` 依赖
- [ ] 处理 `FWDecorator.ts` 依赖
- [ ] 迁移处理后的文件

### 阶段 5: 测试和文档
- [ ] 编写单元测试
- [ ] 编写使用文档
- [ ] 更新 README

### 阶段 6: 集成
- [ ] 在 bl-framework 中使用 npm 包
- [ ] 验证功能正常
- [ ] 发布到 npm（或私有仓库）

## 依赖分析检查清单

对于每个要迁移的文件，需要检查：

1. **导入检查**
   - [ ] 是否导入 `cc`（Cocos Creator）
   - [ ] 是否导入其他业务模块
   - [ ] 是否导入 ECS/行为树等框架模块

2. **API 检查**
   - [ ] 是否使用 Cocos Creator 特定 API
   - [ ] 是否使用 Node.js API（需要 @types/node）
   - [ ] 是否使用浏览器 API

3. **依赖检查**
   - [ ] 是否有外部依赖
   - [ ] 依赖是否适合 npm 包

## 依赖检查结果

### Common 模块依赖检查

#### ✅ 无 Cocos Creator 依赖的文件（可放入 core）
- `FWPath.ts` - 纯 TypeScript 路径工具，无依赖

#### ❌ 有 Cocos Creator 依赖的文件（需要处理）
- `FWLog.ts` - 依赖 `cc/env` 和 `cc`（用于开发模式判断和 Node）
- `FWTimer.ts` - 依赖 `cc/director` 和 `ISchedulable`（Cocos Creator 调度系统）
- `FWFunction.ts` - 大量依赖 Cocos Creator（`cc` 的各种模块，包括 UI、音频等）
- `FWFile.ts` - 需要检查（待确认）
- `FWDecorator.ts` - 需要检查（待确认）
- `FWConstant.ts` - 需要检查（待确认）

### Events 模块依赖检查

- `FWEventDispatcher.ts` - ✅ 无 Cocos Creator 依赖，纯 TypeScript
- `FWEvents.ts` - ✅ 无 Cocos Creator 依赖，纯 TypeScript

## 处理方案

### 方案 1: 移除 Cocos Creator 依赖（推荐）

对于 `FWLog.ts`：
- 移除 `cc/env` 依赖，使用环境变量或配置
- 移除 `cc` Node 依赖，使用原生 console 或自定义日志输出

### 方案 2: 创建适配层

- 在 core 库中提供抽象接口
- 在 bl-framework 扩展中提供 Cocos Creator 实现

### 方案 3: 条件导出

- 提供两个版本：通用版本和 Cocos Creator 版本
- 使用条件导出根据环境选择

## 下一步行动

1. ✅ 创建拆分计划文档
2. ✅ 创建 Core 库详细规划文档
3. ✅ 完成所有文件的依赖检查
4. ✅ 确定依赖处理方案
5. ✅ 创建 core 包的基础结构（第一阶段）
6. ✅ 迁移第一阶段代码（FWPath, Events）
7. ✅ 处理第二阶段代码依赖（FWLog, FWDecorator）
8. ✅ 创建文档和示例
9. ⏳ 在 bl-framework 中集成使用
10. ⏳ 发布到 npm（可选）

## 完成状态

**Core 库第一阶段和第二阶段已完成！**

- ✅ 所有核心代码已迁移
- ✅ 所有 Cocos Creator 依赖已移除
- ✅ TypeScript 编译成功
- ✅ 文档和示例已创建
- ✅ 可以独立使用

---

*创建时间: 2025-11-17*  
*最后更新: 2025-11-17*

