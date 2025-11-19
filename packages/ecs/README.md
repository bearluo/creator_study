# @bl-framework/ecs

bl-framework Entity-Component-System (ECS) 框架

## 安装

```bash
npm install @bl-framework/ecs
```

## 快速开始

### 基本使用

```typescript
import { World, Component, System, Entity } from '@bl-framework/ecs';

// 定义组件
class PositionComponent extends Component {
    x: number = 0;
    y: number = 0;
}

class VelocityComponent extends Component {
    vx: number = 0;
    vy: number = 0;
}

// 定义系统
class MovementSystem extends System {
    onUpdate(dt: number): void {
        // 查询所有具有 Position 和 Velocity 组件的实体
        const query = this.world.query({
            all: [PositionComponent, VelocityComponent]
        });

        for (const entity of query) {
            const position = entity.getComponent(PositionComponent)!;
            const velocity = entity.getComponent(VelocityComponent)!;

            position.x += velocity.vx * dt;
            position.y += velocity.vy * dt;
        }
    }
}

// 创建世界并添加系统
const world = new World();
world.addSystem(new MovementSystem());

// 创建实体并添加组件
const entity = world.createEntity('Player');
entity.addComponent(PositionComponent);
const velocity = entity.addComponent(VelocityComponent);
velocity.vx = 10;
velocity.vy = 5;

// 更新世界
world.update(0.016); // 16ms delta time
```

## API 文档

### World

ECS 世界的核心类，管理所有实体、组件和系统。

#### 方法

- `createEntity(name?: string): Entity` - 创建实体
- `destroyEntity(entityId: EntityId): boolean` - 销毁实体
- `getEntity(entityId: EntityId): Entity | undefined` - 获取实体
- `getAllEntities(): Entity[]` - 获取所有实体
- `addComponent<T>(entityId: EntityId, componentType: ComponentType<T>): T` - 添加组件
- `getComponent<T>(entityId: EntityId, componentType: ComponentType<T>): T | undefined` - 获取组件
- `addSystem(system: System): void` - 添加系统
- `removeSystem(system: System): void` - 移除系统
- `update(dt: number): void` - 更新世界

### Entity

实体类，表示游戏世界中的一个对象。

#### 方法

- `getComponent<T>(componentType: ComponentType<T>): T | undefined` - 获取组件
- `addComponent<T>(componentType: ComponentType<T>): T` - 添加组件
- `getOrCreateComponent<T>(componentType: ComponentType<T>): T` - 获取或创建组件

### Component

组件基类，所有组件都应继承此类。

#### 生命周期

- `onInit?(): void` - 组件初始化时调用
- `onDestroy?(): void` - 组件销毁时调用

### System

系统基类，所有系统都应继承此类。

#### 生命周期

- `onInit?(): void` - 系统初始化时调用
- `onUpdate?(dt: number): void` - 每帧更新时调用
- `onDestroy?(): void` - 系统销毁时调用
- `onEnable?(): void` - 系统启用时调用
- `onDisable?(): void` - 系统禁用时调用

### Query

查询类，用于高效查询符合条件的实体。

#### 使用

```typescript
const query = world.query({
    all: [PositionComponent, VelocityComponent],  // 必须包含所有
    any: [HealthComponent],                        // 至少包含一个
    none: [DeadComponent]                          // 不包含任何
});

for (const entity of query) {
    // 处理实体
}
```

## 装饰器

### @component

用于标记组件类，支持对象池配置。

```typescript
@component({
    name: 'Position',
    pooled: true,
    poolSize: 100
})
class PositionComponent extends Component {
    // ...
}
```

### @system

用于标记系统类，支持优先级配置。

```typescript
@system({
    priority: 0  // 优先级，数值越小越先执行
})
class MovementSystem extends System {
    // ...
}
```

## 工具类

### ComponentPool

组件对象池，用于复用组件实例，减少内存分配。

### BitSet

位集合工具，用于高效的组件类型匹配。

## 类型定义

### EntityId

实体 ID 类型，为 `number`。

### ComponentType<T>

组件类型，为构造函数类型。

### SystemPriority

系统优先级类型，为 `number`。

## 许可证

MIT

