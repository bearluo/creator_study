# 技术上下文

## 技术栈
- **引擎**: Cocos Creator 3.8.4
- **语言**: TypeScript
- **架构**: ECS (Entity-Component-System)
- **模块化**: 扩展系统

## 现有系统

### ECS 系统
- **位置**: `extensions/bl-framework/assets/ecs/`
- **核心组件**: Entity, Component, System, World
- **特性**: BitSet 优化、装饰器支持、查询系统

### 管理器系统
- **位置**: `extensions/bl-framework/assets/manager/`
- **功能**: 统一管理各种功能模块

### 事件系统
- **位置**: `extensions/bl-framework/assets/events/`
- **功能**: 全局事件通信

## 行为树集成考虑

### 与 ECS 的集成
- 行为树可以作为 ECS 的一个 System
- 行为树节点可以作为 Component
- Entity 可以拥有行为树 Component

### 技术选型
- 自研 vs 第三方库
- 节点类型设计
- 执行策略（同步/异步）
- 可视化编辑器支持

## 参考资源
- 行为树设计模式
- ECS 架构最佳实践
- Cocos Creator 扩展开发

