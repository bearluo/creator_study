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

## MVVM 系统需要遵循的模式

### 1. 数据绑定模式
- 使用 `BindingBuilder` 进行类型安全的绑定
- 支持 `bind()` 和 `bindConfig()` 两种方式
- 使用 `ViewTarget` 接口抽象视图操作

### 2. 生命周期管理
- `MVVMComponent` 基类管理生命周期
- 创建/绑定分离：`onLoad` 创建，`onEnable` 绑定
- 清理：`onDisable` 解绑，`onDestroy` 销毁

### 3. 类型安全
- 使用 `Path<T>` 和 `PathValue<T, P>` 确保类型安全
- 泛型 `BindingBuilder<T>` 提供编译时类型检查
- `bindConfig()` 支持类型推断

### 4. 防回环机制
- `silentDepth` 计数器防止同步回环
- `DataBinding` 内部保护防止异步回环

