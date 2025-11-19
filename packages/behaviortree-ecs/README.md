# @bl-framework/behaviortree-ecs

bl-framework Behavior Tree ECS (Entity-Component-System) 集成

## 安装

```bash
npm install @bl-framework/behaviortree-ecs
```

## 依赖

- `@bl-framework/behaviortree` - Behavior Tree 核心库
- `@bl-framework/ecs` - ECS 核心库

## 快速开始

### 基本使用

```typescript
import { World } from '@bl-framework/ecs';
import { BehaviorTree, BehaviorTreeBuilder } from '@bl-framework/behaviortree';
import {
    BehaviorTreeComponent,
    BehaviorTreeSystem,
    BlackboardEntityBinding
} from '@bl-framework/behaviortree-ecs';

// 创建 World
const world = new World();

// 创建行为树
const builder = new BehaviorTreeBuilder();
const tree = builder
    .sequence('root')
        .condition('hasTarget', (blackboard) => {
            return blackboard.get('hasTarget', false);
        })
        .action('attack', (blackboard) => {
            console.log('攻击目标');
            return NodeStatus.SUCCESS;
        })
    .end()
    .build();

// 创建 Entity 并添加 BehaviorTreeComponent
const entity = world.createEntity();
const component = world.addComponent(entity, BehaviorTreeComponent);
component.setBehaviorTree(tree);

// 注册 BehaviorTreeSystem
world.registerSystem(BehaviorTreeSystem);

// 更新系统
world.update(0.016); // 每帧调用
```

### Entity 数据绑定

```typescript
import { BlackboardEntityBinding } from '@bl-framework/behaviortree-ecs';
import { HealthComponent } from './components/HealthComponent';

// 获取 BlackboardEntityBinding
const entityBinding = component.entityBinding!;

// 绑定 Entity 的 Component 属性
entityBinding.bindEntity(
    entity.id,
    HealthComponent,
    'health',
    'health' // 数据键
);

// 设置访问器（通常在 BehaviorTreeSystem 中自动设置）
entityBinding.setEntityAccessor((entityId, componentType, propertyKey) => {
    const comp = world.getComponent(entityId, componentType);
    return comp?.[propertyKey];
});

// 在行为树中使用
const health = entityBinding.get('health', 100);
```

## API 文档

### BehaviorTreeComponent

ECS Component，用于在 Entity 上存储行为树实例。

#### 属性

- `behaviorTree: BehaviorTree | null` - 行为树实例
- `blackboard: Blackboard | null` - 黑板对象
- `entityBinding?: BlackboardEntityBinding` - Entity 绑定扩展
- `enabled: boolean` - 是否启用
- `updateInterval: number` - 执行间隔（秒），0 表示每帧执行
- `priority: number` - 优先级（用于批量更新时的排序）

#### 方法

- `setBehaviorTree(tree: BehaviorTree): void` - 设置行为树
- `setBlackboard(blackboard: Blackboard): void` - 设置黑板
- `shouldUpdate(deltaTime: number): boolean` - 检查是否应该更新

### BehaviorTreeSystem

ECS System，自动执行所有拥有 BehaviorTreeComponent 的 Entity 的行为树。

#### 功能

- 自动查找所有拥有 BehaviorTreeComponent 的 Entity
- 自动设置 Entity 数据访问器
- 根据 `updateInterval` 控制执行频率
- 按 `priority` 排序执行

### BlackboardEntityBinding

Blackboard Entity 绑定扩展，为 Blackboard 添加 Entity 数据绑定功能。

#### 方法

- `bindEntity<T>(entityId, componentType, propertyKey, dataKey?): void` - 绑定 Entity 属性
- `bindEntityProperty<T>(entityId, componentType, propertyKey, dataKey): void` - 绑定 Entity 属性到指定数据键
- `setEntityAccessor(accessor): void` - 设置 Entity 数据访问器
- `get<T>(key, defaultValue?): T` - 获取值（支持 Entity 绑定）
- `has(key): boolean` - 检查是否存在（包括 Entity 绑定）
- `clearBindings(): void` - 清空所有 Entity 绑定
- `getBlackboard(): Blackboard` - 获取底层 Blackboard 实例

### EntityDataHelper

Entity 数据访问辅助类，提供便捷的方法来访问 Entity 的 Component 数据。

#### 静态方法

- `getEntityData<T>(world, entityId, componentType, key): T[keyof T] | undefined` - 获取 Entity 数据
- `setEntityData<T>(world, entityId, componentType, key, value): void` - 设置 Entity 数据
- `hasComponent<T>(world, entityId, componentType): boolean` - 检查是否有组件

## 使用示例

### 完整示例

```typescript
import { World } from '@bl-framework/ecs';
import { BehaviorTreeBuilder, NodeStatus } from '@bl-framework/behaviortree';
import {
    BehaviorTreeComponent,
    BehaviorTreeSystem
} from '@bl-framework/behaviortree-ecs';

// 创建 World
const world = new World();

// 创建行为树
const builder = new BehaviorTreeBuilder();
const tree = builder
    .selector('root')
        .sequence('combat')
            .condition('hasEnemy', (bb) => bb.get('enemy') !== null)
            .condition('hasAmmo', (bb) => bb.get('ammo', 0) > 0)
            .action('shoot', (bb) => {
                console.log('射击');
                bb.set('ammo', bb.get('ammo', 0) - 1);
                return NodeStatus.SUCCESS;
            })
        .end()
        .sequence('reload')
            .condition('needsReload', (bb) => bb.get('ammo', 0) === 0)
            .action('reload', (bb) => {
                console.log('装弹');
                bb.set('ammo', 30);
                return NodeStatus.SUCCESS;
            })
        .end()
    .end()
    .build();

// 创建 Entity
const entity = world.createEntity();
const component = world.addComponent(entity, BehaviorTreeComponent);
component.setBehaviorTree(tree);
component.updateInterval = 0.1; // 每 0.1 秒执行一次

// 注册系统
world.registerSystem(BehaviorTreeSystem);

// 游戏循环
function gameLoop() {
    world.update(0.016); // 假设 60 FPS
    requestAnimationFrame(gameLoop);
}
gameLoop();
```

## 许可证

MIT

