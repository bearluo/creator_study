# 系统模式

## 代码风格和模式

### TypeScript 规范
- 使用 TypeScript 严格模式
- 类型定义完整
- 接口优先于具体实现
- 使用装饰器模式

### ECS 系统模式
- Component: 纯数据类，使用装饰器 `@Component()`
- System: 逻辑处理类，使用装饰器 `@System()`
- Entity: 通过 World 管理
- 使用 BitSet 进行组件查询优化

### 文件组织
- 核心代码在 `core/` 目录
- 功能模块按类型分类（如 `nodes/`, `ecs/`）
- 工具类在 `utils/` 目录
- 测试代码在 `assets/test/` 对应目录

### 命名规范
- 类名：PascalCase
- 方法名：camelCase
- 文件名：PascalCase.ts
- 常量：UPPER_SNAKE_CASE

### 文档规范
- 每个模块有 README.md
- 复杂功能有 QUICK_START.md
- API 文档使用 JSDoc 注释

## 行为树系统需要遵循的模式

### 1. 与 ECS 集成模式
- 使用 Component + System 模式
- BehaviorTreeComponent 存储行为树实例
- BehaviorTreeSystem 负责执行更新

### 2. 节点设计模式
- 节点基类使用抽象类
- 节点状态使用枚举
- 节点生命周期：onEnter -> onUpdate -> onExit

### 3. 构建器模式
- 使用 BehaviorTreeBuilder 链式构建
- 支持流畅的 API 设计

### 4. 数据共享
- 使用 Blackboard 模式共享数据
- 支持 Entity 数据访问

