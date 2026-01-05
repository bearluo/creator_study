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

## MVVM 集成考虑

### 与 Cocos Creator 的集成
- `MVVMComponent` 继承自 `cc.Component`
- 使用 `@property` 装饰器声明视图组件
- 使用 `BindingBuilder` 进行数据绑定

### 技术选型
- 响应式系统：基于 Proxy 的依赖追踪
- 类型安全：TypeScript 模板字面量类型
- 绑定方式：`bind()` 和 `bindConfig()` 两种方式
- 视图适配：`ViewTarget` 接口统一视图操作

## 参考资源
- 行为树设计模式
- ECS 架构最佳实践
- Cocos Creator 扩展开发

