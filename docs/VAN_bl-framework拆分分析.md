# VAN 模式：bl-framework 拆分分析

## 项目概述

**目标**: 将 bl-framework 核心代码拆分为多个独立的 npm 库  
**当前状态**: Core 库已完成并集成  
**分析时间**: 2025-11-17

## Validate（验证）

### 当前状态验证

#### ✅ 已完成
- [x] Core 库（@bl-framework/core）已创建
- [x] Core 库已发布到 npm
- [x] Core 库已集成到 bl-framework
- [x] 包含模块：FWPath, FWLog, FWDecorator, FWEventDispatcher

#### 📊 模块统计（实际数据）

| 模块 | 文件数 | 状态 | 备注 |
|------|--------|------|------|
| common | 8 | ✅ 已迁移到 core | 已通过 index.ts 重新导出 |
| events | 3 | ✅ 已迁移到 core | 已通过 index.ts 重新导出 |
| ecs | 17 | ⏳ 待拆分 | 可独立为包，高优先级 |
| behaviortree | 30 | ⏳ 待拆分 | 可独立为包，依赖 ECS |
| manager | 24 | ⏳ 待分析 | 需要检查依赖关系 |
| network | 9 | ⏳ 待分析 | 需要检查依赖关系 |
| ui | 6 | ⏳ 待分析 | 可能依赖 Cocos Creator |
| extensions | 8 | ⏳ 待分析 | 需要检查 |
| hotupdate | 2 | ⏳ 待分析 | 需要检查 |
| declare | 3 | ✅ 保留 | 类型定义文件 |

## Analyze（分析）

### 模块依赖分析

#### 1. ECS 模块
- **文件数**: 17 个
- **依赖检查**: 需要检查 Cocos Creator 依赖
- **独立性**: 高（ECS 是通用模式）
- **拆分可行性**: ✅ 高
- **建议包名**: `@bl-framework/ecs`

#### 2. BehaviorTree 模块
- **文件数**: 30 个
- **依赖检查**: 已检查，部分依赖 ECS
- **独立性**: 中（依赖 ECS）
- **拆分可行性**: ✅ 高
- **建议包名**: `@bl-framework/behaviortree`
- **依赖关系**: 需要 `@bl-framework/ecs`

#### 3. Manager 模块
- **文件数**: 24 个
- **依赖检查**: 需要检查
- **独立性**: 待分析
- **拆分可行性**: ⏳ 待分析
- **可能依赖**: Cocos Creator, 其他模块

#### 4. Network 模块
- **文件数**: 9 个
- **依赖检查**: 需要检查
- **独立性**: 待分析
- **拆分可行性**: ⏳ 待分析
- **可能依赖**: Cocos Creator, HTTP 库

#### 5. UI 模块
- **文件数**: 6 个
- **依赖检查**: 高度依赖 Cocos Creator
- **独立性**: 低
- **拆分可行性**: ❌ 低（保留在扩展包中）

### 依赖关系图

```
@bl-framework/core (✅ 已完成)
    ↓
@bl-framework/ecs (⏳ 待拆分)
    ↓
@bl-framework/behaviortree (⏳ 待拆分，依赖 ecs)
```

### 拆分优先级

1. **高优先级** - 可以立即拆分
   - ✅ Core（已完成）
   - ⏳ ECS（通用模式，独立性高）
   - ⏳ BehaviorTree（已完成实现，依赖 ECS）

2. **中优先级** - 需要进一步分析
   - ⏳ Manager（需要检查依赖）
   - ⏳ Network（需要检查依赖）

3. **低优先级** - 不适合拆分
   - ❌ UI（高度依赖 Cocos Creator）
   - ❌ 其他 Cocos Creator 特定模块

## Plan（计划）

### 阶段 1: ECS 库拆分（下一步）

#### 目标
创建 `@bl-framework/ecs` npm 包

#### ECS 模块结构
- `core/` - 核心类（Entity, Component, System, World, Query 等）
- `types/` - 类型定义
- `decorators/` - 装饰器
- `utils/` - 工具函数

#### 任务清单
- [ ] 分析 ECS 模块的依赖关系
- [ ] 检查 Cocos Creator 依赖
- [ ] 检查是否有其他外部依赖
- [ ] 创建 npm 包结构（参考 core 库）
- [ ] 迁移 ECS 核心代码
- [ ] 处理依赖关系
- [ ] 编写文档和示例
- [ ] 发布到 npm
- [ ] 集成到 bl-framework
- [ ] 更新 BehaviorTree 依赖（使用 @bl-framework/ecs）

#### 预计时间
3-5 天

### 阶段 2: BehaviorTree 库拆分

#### 目标
创建 `@bl-framework/behaviortree` npm 包

#### 任务清单
- [ ] 分析 BehaviorTree 模块的依赖关系
- [ ] 处理 ECS 依赖（使用 @bl-framework/ecs）
- [ ] 创建 npm 包结构
- [ ] 迁移 BehaviorTree 代码
- [ ] 更新依赖引用
- [ ] 编写文档和示例
- [ ] 发布到 npm
- [ ] 集成到 bl-framework

#### 预计时间
2-3 天（依赖 ECS 库完成）

### 阶段 3: 其他模块分析

#### 目标
分析 Manager、Network 等模块的拆分可行性

#### 任务清单
- [ ] 详细分析 Manager 模块
- [ ] 详细分析 Network 模块
- [ ] 确定拆分方案
- [ ] 制定实施计划

#### 预计时间
2-3 天

## 拆分原则

1. **独立性**: 模块应该尽可能独立，减少依赖
2. **通用性**: 优先拆分通用、可复用的模块
3. **依赖管理**: 明确依赖关系，避免循环依赖
4. **向后兼容**: 保持 API 兼容性
5. **文档完整**: 每个包都要有完整的文档

## 下一步行动

### 立即行动
1. ✅ 完成 VAN 分析（当前）
2. ⏳ 进入 PLAN 模式，制定 ECS 库详细计划
3. ⏳ 开始 ECS 库拆分实施

### 后续行动
1. BehaviorTree 库拆分
2. 其他模块分析
3. 整体优化和文档完善

## 风险评估

### 技术风险
- **依赖复杂性**: ECS 和 BehaviorTree 可能有复杂的依赖关系
- **类型兼容**: TypeScript 类型定义需要保持一致
- **测试覆盖**: 需要确保拆分后功能正常

### 缓解措施
- 详细分析依赖关系
- 充分测试
- 保持向后兼容
- 逐步迁移

---

*分析时间: 2025-11-17*  
*下一步: 进入 PLAN 模式，制定 ECS 库详细拆分计划*

