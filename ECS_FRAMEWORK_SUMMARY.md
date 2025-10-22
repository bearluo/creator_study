# ECS 框架目录结构设计完成

## 📁 完整目录结构

### 核心框架 (extensions/bl-framework/assets/ecs/)

```
extensions/bl-framework/assets/ecs/
├── README.md                    # 框架概述和使用说明
├── STRUCTURE.md                 # 详细的目录结构和设计说明
├── index.ts                     # 框架总入口
│
├── types/                       # 类型定义 (1 文件)
│   └── index.ts                # EntityId, ComponentType, IComponent, ISystem 等
│
├── core/                        # 核心模块 (8 文件)
│   ├── index.ts                # 核心模块导出
│   ├── Entity.ts               # 实体类 - 轻量级ID容器
│   ├── Component.ts            # 组件基类 - 数据容器
│   ├── System.ts               # 系统基类 - 逻辑处理
│   ├── World.ts                # ECS世界 - 框架核心管理器
│   ├── Query.ts                # 查询器 - 实体查询和缓存
│   ├── EntityManager.ts        # 实体管理 - 创建/销毁/对象池
│   ├── ComponentManager.ts     # 组件管理 - 注册/附加/对象池
│   └── SystemManager.ts        # 系统管理 - 注册/更新/优先级
│
├── decorators/                  # 装饰器 (3 文件)
│   ├── index.ts                # 装饰器导出
│   ├── component.ts            # @component 装饰器
│   └── system.ts               # @system 装饰器
│
└── utils/                       # 工具类 (3 文件)
    ├── index.ts                # 工具类导出
    ├── ComponentPool.ts        # 组件对象池实现
    └── BitSet.ts               # 位集合（高性能组件匹配）
```

**统计**: 18 个核心文件

### 示例和测试 (assets/test/ecs/)

```
assets/test/ecs/
├── README.md                    # 使用示例说明
├── ECSExample.ts               # 完整的使用示例
│
├── components/                  # 示例组件 (4 文件)
│   ├── TransformComponent.ts   # 位置/旋转/缩放
│   ├── VelocityComponent.ts    # 速度组件
│   ├── PlayerComponent.ts      # 玩家数据
│   └── HealthComponent.ts      # 生命值系统
│
└── systems/                     # 示例系统 (2 文件)
    ├── MovementSystem.ts       # 移动逻辑
    └── RenderSystem.ts         # 渲染同步
```

**统计**: 8 个示例文件

## 📦 核心模块说明

### 1. World（世界）
ECS 框架的核心管理器，统一管理所有实体、组件和系统。

**主要功能**:
- ✅ 创建和销毁实体
- ✅ 添加和移除组件
- ✅ 注册和管理系统
- ✅ 创建和缓存查询
- ✅ 调试模式支持

### 2. Entity（实体）
轻量级的唯一标识符。

**特性**:
- ✅ 唯一 ID
- ✅ 激活状态管理
- ✅ 对象池支持
- ✅ 销毁标记

### 3. Component（组件）
纯数据容器，所有组件都继承此基类。

**特性**:
- ✅ 实体 ID 关联
- ✅ 启用/禁用状态
- ✅ 对象池自动管理
- ✅ 生命周期钩子

### 4. System（系统）
包含游戏逻辑的处理单元。

**特性**:
- ✅ 优先级控制
- ✅ 启用/禁用
- ✅ 完整的生命周期: onInit, onUpdate, onDestroy, onEnable, onDisable
- ✅ World 引用

### 5. Query（查询器）
高性能的实体查询系统。

**特性**:
- ✅ 多条件查询（all/any/none）
- ✅ 查询结果缓存
- ✅ 增量更新
- ✅ 遍历和统计

### 6. 管理器

#### EntityManager
- ✅ 实体创建/销毁
- ✅ 实体对象池
- ✅ ID 回收机制
- ✅ 实体查询

#### ComponentManager
- ✅ 组件类型注册
- ✅ 组件添加/移除
- ✅ 组件对象池
- ✅ 组件查询

#### SystemManager
- ✅ 系统注册/移除
- ✅ 优先级排序
- ✅ 系统更新
- ✅ 生命周期管理

## 🎯 核心特性

### 1. 高性能
- **对象池技术**: 减少 GC 压力
- **查询缓存**: 避免重复计算
- **位集合优化**: 快速组件匹配
- **增量更新**: 只在必要时更新缓存

### 2. 易用性
- **清晰的 API**: 直观的接口设计
- **TypeScript 类型安全**: 完整的类型定义
- **生命周期管理**: 完整的钩子函数
- **调试友好**: 详细的日志输出

### 3. 灵活性
- **可配置**: 对象池大小、调试模式等
- **优先级控制**: 系统执行顺序可控
- **动态操作**: 运行时添加/移除组件和系统
- **装饰器支持**: 可选的装饰器语法

### 4. 可扩展性
- **模块化设计**: 清晰的职责分离
- **开放接口**: 易于扩展新功能
- **示例丰富**: 完整的使用示例

## 📚 使用示例

### 基础使用流程

```typescript
// 1. 创建 World
const world = new World({
    initialEntityPoolSize: 1000,
    componentPoolSize: 100,
    debug: true
});

// 2. 注册系统
world.registerSystem(MovementSystem);
world.registerSystem(RenderSystem);

// 3. 创建实体并添加组件
const entity = world.createEntity('Player');
const transform = world.addComponent(entity.id, TransformComponent);
const velocity = world.addComponent(entity.id, VelocityComponent);

// 4. 在 update 中更新
update(dt: number) {
    world.update(dt);
}

// 5. 清理
world.destroy();
```

### 创建自定义组件

```typescript
class PositionComponent extends Component {
    x: number = 0;
    y: number = 0;
    
    reset(): void {
        super.reset();
        this.x = 0;
        this.y = 0;
    }
}
```

### 创建自定义系统

```typescript
class MovementSystem extends System {
    private query!: Query;
    
    priority = 0; // 优先级
    
    onInit(): void {
        // 创建查询
        this.query = this.world.createQuery({
            all: [PositionComponent, VelocityComponent]
        });
    }
    
    onUpdate(dt: number): void {
        // 处理所有符合条件的实体
        this.query.forEach(entity => {
            const pos = this.world.getComponent(entity.id, PositionComponent)!;
            const vel = this.world.getComponent(entity.id, VelocityComponent)!;
            
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;
        });
    }
}
```

## 🔄 与 Cocos Creator 集成

框架已经在示例中展示了如何与 Cocos Creator 集成：

1. **RenderSystem**: 同步 ECS 实体位置到 Cocos 节点
2. **TransformComponent**: 使用 Cocos 的 Vec3 类型
3. **生命周期**: 在组件的 onLoad/update/onDestroy 中使用

## 📊 性能优化建议

1. **合理设置池大小**: 根据实际需求配置实体和组件池
2. **复用实体**: 避免频繁创建销毁
3. **系统优先级**: 合理安排执行顺序
4. **缓存组件引用**: 避免重复 getComponent 调用
5. **空间分区**: 大量实体时考虑空间划分

## 🚀 后续扩展方向

1. **序列化**: 实体和组件的保存/加载
2. **网络同步**: 组件状态同步机制
3. **预制体**: 基于 ECS 的预制体系统
4. **事件系统**: 组件变更事件
5. **并行处理**: 多线程系统更新
6. **编辑器支持**: 可视化 ECS 编辑器

## ✅ 完成清单

- [x] 核心框架设计和实现
  - [x] Entity 实体类
  - [x] Component 组件基类
  - [x] System 系统基类
  - [x] World 世界管理器
  - [x] Query 查询器
  - [x] EntityManager
  - [x] ComponentManager
  - [x] SystemManager
- [x] 类型定义
- [x] 工具类
  - [x] ComponentPool 对象池
  - [x] BitSet 位集合
- [x] 装饰器支持
  - [x] @component 装饰器
  - [x] @system 装饰器
- [x] 示例代码
  - [x] 示例组件（Transform, Velocity, Player, Health）
  - [x] 示例系统（Movement, Render）
  - [x] 完整使用示例（ECSExample）
- [x] 文档
  - [x] 框架 README
  - [x] 目录结构说明
  - [x] 示例使用说明
  - [x] 总结文档
- [x] 代码质量
  - [x] 无 Lint 错误
  - [x] TypeScript 类型安全
  - [x] 代码注释完善

## 📝 注意事项

1. 示例场景文件 `ECSExample.scene` 需要在 Cocos Creator 编辑器中手动创建
2. 所有核心代码放在 `extensions/bl-framework/assets/ecs/`
3. 所有示例和测试放在 `assets/test/ecs/`
4. 遵循项目代码规范（4空格缩进、单引号等）
5. 使用 `db://bl-framework/ecs` 导入核心模块

## 🎉 总结

ECS 框架已完整设计并实现，包含：
- **18 个核心文件**: 完整的 ECS 实现
- **8 个示例文件**: 丰富的使用示例
- **完善的文档**: 使用说明和 API 文档
- **高质量代码**: 无 Lint 错误，类型安全
- **性能优化**: 对象池、查询缓存等优化

框架已经可以直接使用，支持高性能的实体-组件-系统架构开发！

