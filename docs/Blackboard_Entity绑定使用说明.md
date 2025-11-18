# Blackboard Entity 绑定使用说明

## 📋 概述

Blackboard 支持将 Entity 的 Component 属性绑定到数据键，使得行为树节点可以通过数据键直接访问 Entity 的 Component 数据。

## 🔧 API 说明

### bindEntity 方法

```typescript
bindEntity<T extends IComponent>(
    entityId: EntityId,
    componentType: ComponentType<T>,
    propertyKey: string,
    dataKey?: string
): void
```

**参数说明**:
- `entityId`: Entity ID
- `componentType`: 组件类型（组件类，如 `TransformComponent`）
- `propertyKey`: 组件属性名（如 `'position'`）
- `dataKey`: 数据键（可选，默认使用 `propertyKey`）

**使用示例**:
```typescript
import { TransformComponent } from 'bl-framework/ecs';

// 方式 1: 使用默认数据键（propertyKey）
blackboard.bindEntity(entityId, TransformComponent, 'position');
blackboard.get('position'); // 获取 TransformComponent.position

// 方式 2: 指定数据键
blackboard.bindEntity(entityId, TransformComponent, 'position', 'pos');
blackboard.get('pos'); // 获取 TransformComponent.position
```

### bindEntityProperty 方法（推荐）

```typescript
bindEntityProperty<T extends IComponent>(
    entityId: EntityId,
    componentType: ComponentType<T>,
    propertyKey: string,
    dataKey: string
): void
```

**参数说明**:
- `entityId`: Entity ID
- `componentType`: 组件类型（组件类）
- `propertyKey`: 组件属性名
- `dataKey`: 数据键

**使用示例**:
```typescript
import { TransformComponent, HealthComponent } from 'bl-framework/ecs';

// 将 TransformComponent.position 绑定到 'position' 数据键
blackboard.bindEntityProperty(
    entityId,
    TransformComponent,
    'position',
    'position'
);
blackboard.get('position'); // 获取 TransformComponent.position

// 将 HealthComponent.health 绑定到 'hp' 数据键
blackboard.bindEntityProperty(
    entityId,
    HealthComponent,
    'health',
    'hp'
);
blackboard.get('hp'); // 获取 HealthComponent.health
```

## 📝 使用流程

### 1. 在 BehaviorTreeComponent 中绑定

```typescript
import { TransformComponent, HealthComponent } from 'bl-framework/ecs';

const component = entity.getComponent(BehaviorTreeComponent);
const blackboard = component.blackboard;

// 绑定 Transform 组件的位置
blackboard.bindEntityProperty(
    entity.id,
    TransformComponent,
    'position',
    'position'
);

// 绑定 Health 组件的生命值
blackboard.bindEntityProperty(
    entity.id,
    HealthComponent,
    'health',
    'health'
);
```

### 2. 在行为树节点中使用

```typescript
// 条件节点
const health = blackboard.get<number>('health', 0);
const hasHealth = health > 0;

// 动作节点
const position = blackboard.get<Vec3>('position');
// 使用 position...
```

## ⚠️ 注意事项

1. **类型安全**: `componentType` 必须是组件类（如 `TransformComponent`），不是字符串
2. **访问器设置**: Entity 数据访问器会在 `BehaviorTreeSystem` 中自动设置
3. **性能考虑**: Entity 数据访问会通过访问器，可能有性能开销
4. **缓存机制**: 获取的数据会被缓存，提高后续访问性能
5. **属性存在性**: 确保绑定的属性在组件中确实存在

## 🔄 数据访问流程

```
blackboard.get('position')
  ↓
检查缓存 → 有缓存 → 返回缓存值
  ↓ 无缓存
检查 Entity 绑定 → 有绑定 → 调用 entityAccessor
  ↓
entityAccessor(entityId, TransformComponent, 'position')
  ↓
通过 World 获取 TransformComponent
  ↓
返回 component.position
  ↓
缓存结果并返回
```

## 💡 类型安全示例

```typescript
// ✅ 正确：使用组件类
blackboard.bindEntityProperty(
    entityId,
    TransformComponent,  // 组件类
    'position',          // 属性名
    'position'           // 数据键
);

// ❌ 错误：使用字符串
// blackboard.bindEntityProperty(entityId, 'Transform', 'position', 'position');
```

## 🔗 相关类型

```typescript
// ComponentType 定义
type ComponentType<T = any> = new (...args: any[]) => T;

// 使用示例
const componentType: ComponentType<TransformComponent> = TransformComponent;
```

---

*最后更新: 2025-11-17*
