# PLAN 模式：ECS 库拆分详细计划

## 项目概述

**目标**: 将 ECS 模块拆分为独立的 npm 包 `@bl-framework/ecs`  
**当前状态**: ECS 模块在 `extensions/bl-framework/assets/ecs/`  
**计划时间**: 2025-11-17  
**预计完成时间**: 3-5 天

## 当前模块分析

### 文件结构

```
ecs/
├── core/                    # 核心类（9 个文件）
│   ├── Entity.ts
│   ├── Component.ts
│   ├── System.ts
│   ├── World.ts
│   ├── Query.ts
│   ├── EntityManager.ts
│   ├── ComponentManager.ts
│   ├── SystemManager.ts
│   └── index.ts
├── types/                   # 类型定义（1 个文件）
│   └── index.ts
├── decorators/              # 装饰器（3 个文件）
│   ├── component.ts
│   ├── system.ts
│   └── index.ts
├── utils/                   # 工具类（3 个文件）
│   ├── BitSet.ts
│   ├── ComponentPool.ts
│   └── index.ts
└── index.ts                 # 主入口
```

**总计**: 17 个 TypeScript 文件

### 核心类分析

#### Core 模块（9 个文件）
1. **Entity.ts** - 实体类
   - 依赖: `types`（IEntity, EntityId, ComponentType, IComponent, IWorld）
   - 无 Cocos Creator 依赖 ✅

2. **Component.ts** - 组件基类
   - 依赖: `types`（IComponent, EntityId）
   - 无 Cocos Creator 依赖 ✅

3. **System.ts** - 系统基类
   - 依赖: `types`（ISystem, SystemPriority）, `World`
   - 无 Cocos Creator 依赖 ✅

4. **World.ts** - 世界类
   - 依赖: 所有 core 类, `types`
   - 无 Cocos Creator 依赖 ✅

5. **Query.ts** - 查询类
   - 依赖: `types`, `Entity`, `Component`
   - 无 Cocos Creator 依赖 ✅

6. **EntityManager.ts** - 实体管理器
   - 依赖: `types`, `Entity`
   - 无 Cocos Creator 依赖 ✅

7. **ComponentManager.ts** - 组件管理器
   - 依赖: `types`, `Component`
   - 无 Cocos Creator 依赖 ✅

8. **SystemManager.ts** - 系统管理器
   - 依赖: `types`, `System`
   - 无 Cocos Creator 依赖 ✅

#### Types 模块（1 个文件）
- **index.ts** - 所有类型定义
  - 无外部依赖 ✅
  - 包含: EntityId, IEntity, IComponent, ISystem, IWorld, QueryConfig, WorldConfig 等

#### Decorators 模块（3 个文件）
- **component.ts** - 组件装饰器
- **system.ts** - 系统装饰器
- 需要检查是否有 Cocos Creator 依赖

#### Utils 模块（3 个文件）
- **BitSet.ts** - 位集合工具
- **ComponentPool.ts** - 组件对象池
- 需要检查是否有外部依赖

### 依赖关系分析

#### 内部依赖
- ✅ 所有模块只依赖 `types` 和内部模块
- ✅ 无循环依赖

#### 外部依赖检查结果 ✅

**检查完成**:
- ✅ decorators 模块：无 Cocos Creator 依赖
  - `component.ts` - 纯 TypeScript 装饰器
  - `system.ts` - 纯 TypeScript 装饰器
- ✅ utils 模块：无外部依赖
  - `BitSet.ts` - 纯 TypeScript，使用 Uint32Array
  - `ComponentPool.ts` - 仅依赖内部 `Component` 和 `ComponentType`
- ✅ core 模块：无 Cocos Creator 依赖
- ✅ types 模块：无外部依赖

**结论**: ECS 模块完全独立，无任何外部依赖，可以安全拆分 ✅

#### 被依赖关系

**已确认**:
- ✅ BehaviorTree 模块依赖 ECS
  - 导入方式: `import { EntityId, Component } from '../../ecs'`
  - 需要更新为: `import { EntityId, Component } from '@bl-framework/ecs'`
- ⏳ 其他模块：需要进一步检查是否有依赖 ECS

## 拆分计划

### 阶段 1: 准备工作 ✅

#### 任务清单
- [x] 详细检查所有文件的依赖关系
- [x] 确认无 Cocos Creator 依赖 ✅
- [x] 确认无其他外部依赖 ✅
- [x] 检查 BehaviorTree 对 ECS 的依赖方式 ✅
- [x] 确定需要保留在扩展包中的内容（无，全部可迁移）✅

#### 检查结果
- ✅ 所有文件无 Cocos Creator 依赖
- ✅ 所有文件无外部 npm 包依赖
- ✅ BehaviorTree 使用相对路径导入，需要更新
- ✅ 所有 ECS 代码可以完全迁移

#### 交付物
- ✅ 依赖关系分析报告（已完成）
- ✅ 文件清单（17 个文件）

### 阶段 2: 创建 npm 包结构（0.5 天）

#### 任务清单
- [ ] 创建 `packages/ecs` 目录
- [ ] 初始化 package.json
- [ ] 配置 TypeScript（参考 core 库）
- [ ] 创建目录结构（src/core, src/types, src/decorators, src/utils）
- [ ] 创建 .gitignore
- [ ] 创建 README.md 模板

#### 目录结构
```
packages/ecs/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── src/
│   ├── index.ts
│   ├── core/
│   │   ├── index.ts
│   │   ├── Entity.ts
│   │   ├── Component.ts
│   │   ├── System.ts
│   │   ├── World.ts
│   │   ├── Query.ts
│   │   ├── EntityManager.ts
│   │   ├── ComponentManager.ts
│   │   └── SystemManager.ts
│   ├── types/
│   │   └── index.ts
│   ├── decorators/
│   │   ├── index.ts
│   │   ├── component.ts
│   │   └── system.ts
│   └── utils/
│       ├── index.ts
│       ├── BitSet.ts
│       └── ComponentPool.ts
├── dist/
└── examples/
```

### 阶段 3: 迁移代码（1 天）

#### 任务清单
- [ ] 迁移 types 模块（最简单，无依赖）
- [ ] 迁移 core 模块
  - [ ] Entity.ts
  - [ ] Component.ts
  - [ ] System.ts
  - [ ] World.ts
  - [ ] Query.ts
  - [ ] EntityManager.ts
  - [ ] ComponentManager.ts
  - [ ] SystemManager.ts
- [ ] 迁移 decorators 模块
- [ ] 迁移 utils 模块
- [ ] 创建主入口文件
- [ ] 更新所有导入路径

#### 注意事项
- 保持文件结构一致
- 更新相对路径导入
- 确保类型导出正确

### 阶段 4: 处理依赖和编译（0.5 天）

#### 任务清单
- [ ] 检查并修复导入路径
- [ ] 运行 TypeScript 编译
- [ ] 修复编译错误
- [ ] 验证类型定义生成
- [ ] 检查导出是否正确

### 阶段 5: 文档和示例（1 天）

#### 任务清单
- [ ] 编写 README.md
  - [ ] 安装说明
  - [ ] 快速开始
  - [ ] API 文档
  - [ ] 使用示例
- [ ] 创建使用示例（examples/）
- [ ] 编写迁移指南（从扩展包迁移到 npm 包）

### 阶段 6: 测试和验证（0.5 天）

#### 任务清单
- [ ] 创建基础测试用例
- [ ] 验证核心功能
- [ ] 验证类型定义
- [ ] 检查导出完整性

### 阶段 7: 发布和集成（1 天）

#### 任务清单
- [ ] 发布到 npm
- [ ] 在 bl-framework 中集成
  - [ ] 添加依赖到 package.json
  - [ ] 创建 `ecs/index.ts` 重新导出
  - [ ] 更新 BehaviorTree 依赖（使用 @bl-framework/ecs）
- [ ] 验证集成后功能正常
- [ ] 更新相关文档

## 详细任务分解

### 任务 1: 依赖检查（阶段 1）

**优先级**: 高  
**预计时间**: 2 小时

**检查项**:
- [ ] 检查所有文件是否有 `import from 'cc'`
- [ ] 检查是否有其他 npm 包依赖
- [ ] 检查是否有 Node.js 特定 API
- [ ] 检查是否有浏览器特定 API
- [ ] 检查 BehaviorTree 如何使用 ECS

**交付物**: 依赖检查报告

### 任务 2: 包结构创建（阶段 2）

**优先级**: 高  
**预计时间**: 2 小时

**步骤**:
1. 创建目录结构
2. 复制 core 库的配置文件模板
3. 修改 package.json（包名、描述等）
4. 配置 TypeScript

**交付物**: 完整的包结构

### 任务 3: 代码迁移（阶段 3）

**优先级**: 高  
**预计时间**: 4 小时

**迁移顺序**:
1. types（无依赖）
2. utils（可能依赖 types）
3. core（依赖 types）
4. decorators（依赖 types 和 core）
5. 主入口文件

**注意事项**:
- 保持原有代码逻辑不变
- 只更新导入路径
- 确保类型导出正确

### 任务 4: 编译验证（阶段 4）

**优先级**: 高  
**预计时间**: 2 小时

**验证项**:
- [ ] TypeScript 编译成功
- [ ] 生成所有 .d.ts 文件
- [ ] 生成所有 .js 文件
- [ ] 导出结构正确

### 任务 5: 文档编写（阶段 5）

**优先级**: 中  
**预计时间**: 4 小时

**文档内容**:
- API 参考
- 使用示例
- 迁移指南
- 最佳实践

### 任务 6: 集成（阶段 7）

**优先级**: 高  
**预计时间**: 4 小时

**集成步骤**:
1. 发布 npm 包
2. 在 bl-framework 中添加依赖
3. 创建重新导出文件
4. 更新 BehaviorTree 依赖
5. 验证功能

## 风险评估

### 技术风险

1. **依赖复杂性**
   - 风险: ECS 可能有隐藏的依赖关系
   - 缓解: 详细检查所有文件

2. **类型兼容性**
   - 风险: TypeScript 类型定义可能不兼容
   - 缓解: 保持类型定义一致

3. **BehaviorTree 依赖**
   - 风险: BehaviorTree 直接导入 ECS，需要更新
   - 缓解: 创建重新导出文件，保持向后兼容

### 时间风险

- **预计时间**: 3-5 天
- **缓冲时间**: 1 天
- **总时间**: 4-6 天

## 成功标准

### 功能标准
- ✅ 所有 ECS 功能正常工作
- ✅ TypeScript 编译成功
- ✅ 类型定义完整
- ✅ 无编译错误和警告

### 集成标准
- ✅ npm 包可以正常安装
- ✅ bl-framework 可以正常使用
- ✅ BehaviorTree 可以正常使用 ECS
- ✅ 向后兼容

### 文档标准
- ✅ README 完整
- ✅ API 文档完整
- ✅ 使用示例完整
- ✅ 迁移指南完整

## 下一步行动

### 立即开始
1. ✅ 详细检查依赖关系（阶段 1）- 已完成
2. ⏳ 创建包结构（阶段 2）- 下一步
3. ⏳ 开始代码迁移（阶段 3）

### 当前状态
- ✅ 阶段 1 已完成：所有依赖检查完成，确认可以拆分
- ⏳ 阶段 2 待开始：创建 npm 包结构

### 后续计划
1. 完成 ECS 库拆分后，继续 BehaviorTree 库拆分
2. 分析其他模块的拆分可行性

## 参考

- Core 库拆分经验
- Core 库目录结构
- Core 库 package.json 配置
- Core 库 TypeScript 配置

---

*计划时间: 2025-11-17*  
*下一步: 开始阶段 1 - 详细依赖检查*

