# VAN: BehaviorTree 旧代码清理分析

## 分析目标

清理 `extensions/bl-framework/assets/behaviortree/` 目录中已迁移到 npm 包的旧代码文件。

## 当前状态

### 已迁移到 npm 包的文件

#### 核心库 (@bl-framework/behaviortree)
- ✅ `core/NodeStatus.ts` - 已迁移
- ✅ `core/types.ts` - 已迁移
- ✅ `core/Blackboard.ts` - 已迁移（已拆分，移除 Entity 绑定）
- ✅ `core/Node.ts` - 已迁移
- ✅ `core/BehaviorTree.ts` - 已迁移
- ✅ `core/BehaviorTreeExecutor.ts` - 已迁移
- ✅ `nodes/` 目录下所有文件 - 已迁移
- ✅ `utils/BehaviorTreeBuilder.ts` - 已迁移

#### ECS 扩展库 (@bl-framework/behaviortree-ecs)
- ✅ `ecs/BehaviorTreeComponent.ts` - 已迁移
- ✅ `ecs/BehaviorTreeSystem.ts` - 已迁移
- ✅ `ecs/EntityDataHelper.ts` - 已迁移
- ✅ `ecs/BlackboardEntityBinding.ts` - 已迁移

### 保留的文件（re-export）

- ✅ `core/index.ts` - 从 `@bl-framework/behaviortree` 重新导出
- ✅ `nodes/index.ts` - 从 `@bl-framework/behaviortree` 重新导出
- ✅ `utils/index.ts` - 从 `@bl-framework/behaviortree` 重新导出
- ✅ `ecs/index.ts` - 从 `@bl-framework/behaviortree-ecs` 重新导出
- ✅ `index.ts` - 主入口文件
- ✅ `README.md` - 文档文件

## 需要删除的文件

### core/ 目录
- ❌ `NodeStatus.ts` - 已迁移到 npm 包
- ❌ `types.ts` - 已迁移到 npm 包
- ❌ `Blackboard.ts` - 已迁移到 npm 包
- ❌ `Node.ts` - 已迁移到 npm 包
- ❌ `BehaviorTree.ts` - 已迁移到 npm 包
- ❌ `BehaviorTreeExecutor.ts` - 已迁移到 npm 包

### nodes/ 目录
- ❌ `action/Action.ts` - 已迁移到 npm 包
- ❌ `composite/CompositeNode.ts` - 已迁移到 npm 包
- ❌ `composite/Selector.ts` - 已迁移到 npm 包
- ❌ `composite/Sequence.ts` - 已迁移到 npm 包
- ❌ `composite/Parallel.ts` - 已迁移到 npm 包
- ❌ `condition/Condition.ts` - 已迁移到 npm 包
- ❌ `decorator/DecoratorNode.ts` - 已迁移到 npm 包
- ❌ `decorator/Inverter.ts` - 已迁移到 npm 包
- ❌ `decorator/Repeater.ts` - 已迁移到 npm 包
- ❌ `decorator/UntilSuccess.ts` - 已迁移到 npm 包
- ❌ `decorator/UntilFailure.ts` - 已迁移到 npm 包

### utils/ 目录
- ❌ `BehaviorTreeBuilder.ts` - 已迁移到 npm 包

### ecs/ 目录
- ✅ 已清理（之前已删除）

## 清理计划

### 阶段 1: 删除核心文件
1. 删除 `core/` 目录下所有 `.ts` 文件（保留 `index.ts`）
2. 删除 `nodes/` 目录下所有 `.ts` 文件（保留各子目录的 `index.ts`）
3. 删除 `utils/` 目录下所有 `.ts` 文件（保留 `index.ts`）

### 阶段 2: 验证
1. 检查所有 re-export 文件是否正确
2. 运行编译验证
3. 确认无导入错误

## 风险评估

### 低风险
- ✅ 所有代码已迁移到 npm 包
- ✅ re-export 文件已创建
- ✅ 编译已验证通过

### 注意事项
- ⚠️ 需要确保所有 `.meta` 文件也被删除（Cocos Creator 元数据）
- ⚠️ 需要确保没有其他文件引用这些旧文件

## 执行建议

1. **备份**: 虽然代码已迁移，但建议先确认 npm 包编译成功
2. **批量删除**: 可以批量删除整个目录，然后重新创建 re-export 文件
3. **验证**: 删除后立即运行编译验证

---

*分析时间: 2025-11-18*  
*状态: 准备执行清理*

