# 行为树测试

## 📋 概述

本目录包含行为树系统的测试用例和示例代码。

## 🧪 测试内容

### 基础测试
- 节点执行测试
- 组合节点测试
- 装饰器节点测试
- 行为树执行测试

### 集成测试
- ECS 集成测试
- Entity 数据访问测试
- 多 Entity 并发测试

### 性能测试
- 执行性能测试
- 内存使用测试
- 大量 Entity 测试

## 📝 测试文件

- `BasicTest.ts` - 基础功能测试
- `ECSIntegrationTest.ts` - ECS 集成测试
- `scene-behaviortree-test.ts` - 场景测试组件
- `components/` - 测试用组件
  - `HealthComponent.ts` - 健康组件
  - `PositionComponent.ts` - 位置组件
- `测试使用说明.md` - 详细使用说明

## 🚀 运行测试

### 方式 1: 场景测试（推荐）

1. 在 Cocos Creator 中打开测试场景
2. 场景中应包含 `SceneBehaviortreeTest` 组件
3. 运行场景，测试会自动执行

详细说明请参考：[测试使用说明](./测试使用说明.md)

### 方式 2: 代码调用

```typescript
// 运行所有基础测试
BehaviorTreeBasicTest.runAll();

// 运行所有 ECS 集成测试
ECSIntegrationTest.runAll();

// 运行单个测试
BehaviorTreeBasicTest.testSimpleCondition();
ECSIntegrationTest.testBasicIntegration();
```

---

*最后更新: 2025-11-17*

