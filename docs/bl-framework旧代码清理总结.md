# bl-framework 旧代码清理总结

## 清理概述

在完成 Core 库和 ECS 库迁移到 npm 包后，清理了已迁移的旧源文件，确保所有代码都使用 npm 包。

## 清理内容

### 1. Core 库旧文件清理

删除了以下文件（2 个文件）：

- ✅ `extensions/bl-framework/assets/common/FWLog.ts` - 已迁移到 @bl-framework/core
- ✅ `extensions/bl-framework/assets/common/FWPath.ts` - 已迁移到 @bl-framework/core

#### 更新的文件（2 个）

1. **extensions/bl-framework/assets/common/FWFunction.ts**
   - 旧: `import { Log } from './FWLog';`
   - 新: `import { Log } from './index';`

2. **extensions/bl-framework/assets/common/FWFile.ts**
   - 旧: `import { log } from './FWLog';`
   - 新: `import { log } from './index';`

### 2. ECS 库旧文件清理

删除了以下目录和文件（共 16 个文件）：

- ✅ `extensions/bl-framework/assets/ecs/core/` (9 个文件)
  - Component.ts
  - ComponentManager.ts
  - Entity.ts
  - EntityManager.ts
  - index.ts
  - Query.ts
  - System.ts
  - SystemManager.ts
  - World.ts

- ✅ `extensions/bl-framework/assets/ecs/decorators/` (3 个文件)
  - component.ts
  - index.ts
  - system.ts

- ✅ `extensions/bl-framework/assets/ecs/types/` (1 个文件)
  - index.ts

- ✅ `extensions/bl-framework/assets/ecs/utils/` (3 个文件)
  - BitSet.ts
  - ComponentPool.ts
  - index.ts

### 2. 更新导入路径

在删除旧文件前，更新了 BehaviorTree 模块的导入路径：

#### 更新的文件（4 个）

1. **extensions/bl-framework/assets/behaviortree/ecs/BehaviorTreeSystem.ts**
   - 旧: 
     ```typescript
     import { System } from '../../ecs/core/System';
     import { system } from '../../ecs/decorators/system';
     import { Query } from '../../ecs/core/Query';
     import { Entity } from '../../ecs/core/Entity';
     import { ComponentType, EntityId, IComponent } from '../../ecs';
     ```
   - 新: `import { System, Query, Entity, ComponentType, EntityId, IComponent, system } from '../../ecs';`

2. **extensions/bl-framework/assets/behaviortree/ecs/BehaviorTreeComponent.ts**
   - 旧: 
     ```typescript
     import { EntityId } from '../../ecs';
     import { Component } from '../../ecs/core/Component';
     import { component } from '../../ecs/decorators/component';
     ```
   - 新: `import { EntityId, Component, component } from '../../ecs';`

3. **extensions/bl-framework/assets/behaviortree/core/Blackboard.ts**
   - 旧: `import { ComponentType, EntityId, IComponent } from '../../ecs/types';`
   - 新: `import { ComponentType, EntityId, IComponent } from '../../ecs';`

4. **extensions/bl-framework/assets/behaviortree/ecs/EntityDataHelper.ts**
   - 旧: 
     ```typescript
     import { ComponentType, EntityId, IComponent } from '../../ecs/types';
     import { World } from '../../ecs/core/World';
     import { Component } from '../../ecs/core/Component';
     ```
   - 新: `import { ComponentType, EntityId, IComponent, World, Component } from '../../ecs';`

### 3. 保留的文件

以下文件保留，因为它们提供重新导出功能：

- ✅ `extensions/bl-framework/assets/ecs/index.ts` - 重新导出 `@bl-framework/ecs`
- ✅ `extensions/bl-framework/assets/common/index.ts` - 重新导出 `@bl-framework/core` 的 common 工具
- ✅ `extensions/bl-framework/assets/events/index.ts` - 重新导出 `@bl-framework/core` 的事件系统

## 验证结果

### 编译验证

- ✅ TypeScript 编译成功
- ✅ 无编译错误
- ✅ 无类型错误
- ✅ 所有导入路径正确

### 集成验证

- ✅ 所有文件使用重新导出路径
- ✅ 正确使用 `@bl-framework/core` 和 `@bl-framework/ecs` npm 包
- ✅ 向后兼容性保持
- ✅ 无旧文件残留

## 清理统计

- **删除的文件**: 
  - 16 个 ECS 源文件
  - 2 个 Core 源文件（FWLog.ts, FWPath.ts）
  - **总计**: 18 个旧文件
- **更新的文件**: 
  - 4 个 BehaviorTree 文件
  - 2 个 Core 相关文件（FWFunction.ts, FWFile.ts）
  - **总计**: 6 个文件
- **保留的文件**: 3 个重新导出文件
  - `extensions/bl-framework/assets/common/index.ts`
  - `extensions/bl-framework/assets/events/index.ts`
  - `extensions/bl-framework/assets/ecs/index.ts`

## 总结

旧代码清理工作已完成：

- ✅ 删除了所有已迁移到 npm 包的旧源文件（18 个文件）
  - ECS 库：16 个文件
  - Core 库：2 个文件（FWLog.ts, FWPath.ts）
- ✅ 更新了所有导入路径，使用重新导出（6 个文件）
  - BehaviorTree 模块：4 个文件
  - Core 相关模块：2 个文件
- ✅ TypeScript 编译成功
- ✅ 所有代码现在正确使用 npm 包
- ✅ 保持向后兼容性

现在 bl-framework 完全依赖 npm 包，不再包含已迁移的旧源文件。

---

*清理时间: 2025-11-17*  
*状态: ✅ 全部完成*

