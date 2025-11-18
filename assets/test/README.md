# 测试目录

## 📋 概述

本目录包含框架的测试用例和测试组件。

## 📁 目录结构

```
assets/test/
├── behaviortree/       # 行为树测试
│   ├── BasicTest.ts
│   ├── ECSIntegrationTest.ts
│   ├── scene-behaviortree-test.ts
│   └── components/     # 行为树测试用组件
│       ├── HealthComponent.ts
│       ├── PositionComponent.ts
│       └── README.md
└── ecs/                # ECS 测试（如果存在）
```

## 🧪 测试组件

行为树测试用组件位于 `behaviortree/components/` 目录，用于测试行为树系统与 ECS 的集成。

**注意**: 这些组件仅用于测试目的，不应在生产代码中使用。

详细说明请参考：[测试组件 README](./behaviortree/components/README.md)

## 🚀 运行测试

### 行为树测试

详细说明请参考：[行为树测试 README](./behaviortree/README.md)

测试用组件说明：[测试组件 README](./behaviortree/components/README.md)

### ECS 测试

详细说明请参考：[ECS 测试文档](./ecs/README.md)（如果存在）

---

*最后更新: 2025-11-17*

