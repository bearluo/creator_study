# @bl-framework/behaviortree

bl-framework Behavior Tree (行为树) 系统

## 安装

```bash
npm install @bl-framework/behaviortree
```

## 快速开始

### 基本使用

```typescript
import {
    BehaviorTree,
    BehaviorTreeBuilder,
    NodeStatus,
    Selector,
    Sequence,
    Condition,
    Action
} from '@bl-framework/behaviortree';

// 使用 Builder 创建行为树
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

// 执行行为树
const blackboard = tree.getBlackboard();
blackboard.set('hasTarget', true);

const status = tree.execute();
console.log('执行状态:', status); // SUCCESS
```

### 手动创建行为树

```typescript
import {
    BehaviorTree,
    Selector,
    Sequence,
    Condition,
    Action,
    NodeStatus
} from '@bl-framework/behaviortree';

// 创建节点
const checkHealth = new Condition('checkHealth', (blackboard) => {
    return blackboard.get('health', 0) > 50;
});

const attack = new Action('attack', (blackboard) => {
    console.log('攻击');
    return NodeStatus.SUCCESS;
});

const flee = new Action('flee', (blackboard) => {
    console.log('逃跑');
    return NodeStatus.SUCCESS;
});

// 创建行为树
const root = new Selector('root');
root.addChild(checkHealth);
root.addChild(attack);
root.addChild(flee);

const tree = new BehaviorTree(root);

// 执行
const blackboard = tree.getBlackboard();
blackboard.set('health', 30);

const status = tree.execute();
```

## API 文档

### BehaviorTree

行为树主类，管理行为树的执行。

#### 方法

- `execute(): NodeStatus` - 执行行为树
- `reset(): void` - 重置行为树状态
- `isComplete(): boolean` - 是否完成（成功或失败）
- `isRunning(): boolean` - 是否正在运行
- `getStatus(): NodeStatus` - 获取当前状态
- `setBlackboard(blackboard: Blackboard): void` - 设置黑板
- `getBlackboard(): Blackboard` - 获取黑板

### Blackboard

黑板（共享数据存储），用于节点之间共享数据。

#### 方法

- `set<T>(key: string, value: T): void` - 设置值
- `get<T>(key: string, defaultValue?: T): T` - 获取值
- `has(key: string): boolean` - 检查是否存在
- `delete(key: string): boolean` - 删除键
- `clear(): void` - 清空所有数据
- `watch(key: string, listener: BlackboardListener): () => void` - 监听数据变化
- `clearCache(): void` - 清空缓存
- `getCacheVersion(): number` - 获取缓存版本号

### Node

节点基类，所有节点都应继承此类。

#### 节点类型

- **Composite Nodes** (组合节点)
  - `Selector` - 选择器（任一子节点成功即成功）
  - `Sequence` - 序列（所有子节点成功才成功）
  - `Parallel` - 并行（同时执行所有子节点）

- **Decorator Nodes** (装饰器节点)
  - `Inverter` - 取反器
  - `Repeater` - 重复器
  - `UntilSuccess` - 直到成功
  - `UntilFailure` - 直到失败

- **Condition Nodes** (条件节点)
  - `Condition` - 条件节点

- **Action Nodes** (动作节点)
  - `Action` - 动作节点

### BehaviorTreeBuilder

行为树构建器，提供流畅的 API 构建行为树。

#### 方法

- `selector(name: string): this` - 创建选择器节点
- `sequence(name: string): this` - 创建序列节点
- `parallel(name: string, policy?: ParallelPolicy): this` - 创建并行节点
- `condition(name: string, condition: ConditionFunction): this` - 创建条件节点
- `action(name: string, action: ActionFunction): this` - 创建动作节点
- `decorator(decorator: DecoratorType, config?: DecoratorConfig): this` - 添加装饰器
- `end(): this` - 结束当前节点（返回父节点）
- `build(blackboard?: Blackboard): BehaviorTree` - 构建行为树

## 类型定义

### NodeStatus

节点状态枚举：

- `READY` - 准备状态
- `SUCCESS` - 成功状态
- `FAILURE` - 失败状态
- `RUNNING` - 运行状态

### ParallelPolicy

并行策略：

- `ALL_SUCCESS` - 全部成功才算成功
- `ALL_FAILURE` - 全部失败才算失败
- `ANY_SUCCESS` - 任一成功即成功
- `ANY_FAILURE` - 任一失败即失败

### DecoratorType

装饰器类型：

- `INVERTER` - 取反器
- `REPEATER` - 重复器
- `UNTIL_SUCCESS` - 直到成功
- `UNTIL_FAILURE` - 直到失败

## 使用示例

### 复杂行为树示例

```typescript
import { BehaviorTreeBuilder, NodeStatus } from '@bl-framework/behaviortree';

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

// 执行
const blackboard = tree.getBlackboard();
blackboard.set('enemy', { id: 1 });
blackboard.set('ammo', 0);

tree.execute(); // 执行装弹
tree.execute(); // 执行射击
```

## 许可证

MIT

