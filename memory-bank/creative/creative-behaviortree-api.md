# 行为树系统 API 设计

## 📋 设计概述

**设计类型**: API 设计  
**创建时间**: 2025-11-17  
**设计阶段**: CREATIVE 模式

## 🎯 设计目标

1. **易用性**: API 应该直观、易于理解和使用
2. **灵活性**: 支持多种使用场景和扩展方式
3. **类型安全**: 充分利用 TypeScript 类型系统
4. **一致性**: 与现有 ECS 系统保持一致的设计风格

## 🔧 核心 API 设计

### 1. BehaviorTreeBuilder（构建器）

#### 设计目标
- 提供流畅的链式 API
- 支持嵌套结构
- 类型安全
- 易于扩展

#### API 设计

```typescript
/**
 * 行为树构建器
 * 提供链式 API 构建行为树
 */
export class BehaviorTreeBuilder {
    private root: Node | null = null;
    private nodeStack: Node[] = [];
    private currentNode: Node | null = null;

    /**
     * 创建选择器节点
     * @param name 节点名称
     */
    selector(name: string): this;

    /**
     * 创建序列器节点
     * @param name 节点名称
     */
    sequence(name: string): this;

    /**
     * 创建并行节点
     * @param name 节点名称
     * @param policy 并行策略（全部成功/全部失败/任一成功/任一失败）
     */
    parallel(name: string, policy?: ParallelPolicy): this;

    /**
     * 创建条件节点
     * @param name 节点名称
     * @param condition 条件函数
     */
    condition(name: string, condition: ConditionFunction): this;

    /**
     * 创建动作节点
     * @param name 节点名称
     * @param action 动作函数
     */
    action(name: string, action: ActionFunction): this;

    /**
     * 添加装饰器节点
     * @param decorator 装饰器类型
     * @param config 装饰器配置
     */
    decorator(decorator: DecoratorType, config?: DecoratorConfig): this;

    /**
     * 结束当前节点（返回到父节点）
     */
    end(): this;

    /**
     * 构建行为树
     * @param blackboard 可选的黑板对象
     */
    build(blackboard?: Blackboard): BehaviorTree;
}
```

#### 使用示例

```typescript
// 基础示例
const tree = new BehaviorTreeBuilder()
    .selector('root')
        .sequence('patrol')
            .condition('checkDistance', (bb) => bb.get('distance') < 10)
            .action('moveToTarget', (bb) => {
                // 移动逻辑
                return NodeStatus.SUCCESS;
            })
        .end()
        .action('idle', () => NodeStatus.SUCCESS)
    .end()
    .build();

// 复杂示例（带装饰器）
const complexTree = new BehaviorTreeBuilder()
    .selector('root')
        .decorator('repeater', { count: 3 })
            .sequence('attack')
                .condition('hasTarget', (bb) => bb.has('target'))
                .action('attack', (bb) => {
                    const target = bb.get('target');
                    // 攻击逻辑
                    return NodeStatus.SUCCESS;
                })
            .end()
        .end()
        .decorator('inverter')
            .condition('isHealthy', (bb) => bb.get('health') > 50)
        .end()
        .action('flee', () => NodeStatus.SUCCESS)
    .end()
    .build();
```

#### 设计考虑

**优点**:
- ✅ 链式 API 流畅易读
- ✅ 支持嵌套结构
- ✅ 类型安全
- ✅ 易于扩展

**挑战**:
- ⚠️ 需要维护节点栈
- ⚠️ 错误处理复杂
- ⚠️ 调试可能困难

**解决方案**:
- 使用节点栈管理嵌套关系
- 添加验证和错误提示
- 提供调试工具

### 2. 节点扩展 API

#### 设计目标
- 易于创建自定义节点
- 类型安全
- 支持生命周期钩子
- 与现有系统集成

#### 自定义节点基类

```typescript
/**
 * 条件节点基类
 */
export abstract class ConditionNode extends Node {
    /**
     * 检查条件
     * @param blackboard 黑板对象
     * @returns 条件是否满足
     */
    abstract check(blackboard: Blackboard): boolean;

    execute(blackboard: Blackboard): NodeStatus {
        return this.check(blackboard) 
            ? NodeStatus.SUCCESS 
            : NodeStatus.FAILURE;
    }
}

/**
 * 动作节点基类
 */
export abstract class ActionNode extends Node {
    /**
     * 执行动作
     * @param blackboard 黑板对象
     * @returns 执行状态
     */
    abstract run(blackboard: Blackboard): NodeStatus;

    execute(blackboard: Blackboard): NodeStatus {
        return this.run(blackboard);
    }
}
```

#### 自定义节点示例

```typescript
// 自定义条件节点
class HasTargetCondition extends ConditionNode {
    check(blackboard: Blackboard): boolean {
        return blackboard.has('target') && 
               blackboard.get('target') !== null;
    }
}

// 自定义动作节点
class MoveToTargetAction extends ActionNode {
    constructor(
        private speed: number = 1.0,
        private threshold: number = 0.1
    ) {
        super();
    }

    run(blackboard: Blackboard): NodeStatus {
        const target = blackboard.get<Vec3>('target');
        const position = blackboard.get<Vec3>('position');
        
        if (!target || !position) {
            return NodeStatus.FAILURE;
        }

        const distance = Vec3.distance(position, target);
        if (distance < this.threshold) {
            return NodeStatus.SUCCESS;
        }

        // 移动逻辑
        const direction = Vec3.subtract(target, position).normalize();
        const newPosition = Vec3.add(
            position, 
            Vec3.multiplyScalar(direction, this.speed * deltaTime)
        );
        blackboard.set('position', newPosition);

        return NodeStatus.RUNNING;
    }
}
```

### 3. Blackboard API

#### 设计目标
- 类型安全的数据访问
- 支持嵌套数据
- 支持数据监听
- 性能优化

#### API 设计

```typescript
/**
 * 黑板（共享数据存储）
 */
export class Blackboard {
    private data: Map<string, any> = new Map();
    private listeners: Map<string, Set<BlackboardListener>> = new Map();

    /**
     * 设置值
     * @param key 键
     * @param value 值
     */
    set<T>(key: string, value: T): void;

    /**
     * 获取值
     * @param key 键
     * @param defaultValue 默认值
     */
    get<T>(key: string, defaultValue?: T): T;

    /**
     * 检查键是否存在
     * @param key 键
     */
    has(key: string): boolean;

    /**
     * 删除键
     * @param key 键
     */
    delete(key: string): boolean;

    /**
     * 清空所有数据
     */
    clear(): void;

    /**
     * 监听数据变化
     * @param key 键
     * @param listener 监听器
     */
    watch(key: string, listener: BlackboardListener): () => void;

    /**
     * 绑定 Entity 数据
     * @param entityId Entity ID
     * @param componentType 组件类型
     */
    bindEntity(entityId: EntityId, componentType: string): void;
}
```

#### 使用示例

```typescript
const blackboard = new Blackboard();

// 基本使用
blackboard.set('target', { x: 10, y: 0, z: 5 });
const target = blackboard.get<Vec3>('target');

// 监听数据变化
const unsubscribe = blackboard.watch('health', (newValue, oldValue) => {
    console.log(`Health changed: ${oldValue} -> ${newValue}`);
});

// 绑定 Entity 数据
blackboard.bindEntity(entityId, 'Transform');
const position = blackboard.get('position'); // 自动从 Entity 获取
```

### 4. ECS 集成 API

#### Component API

```typescript
/**
 * 行为树组件
 */
@Component('BehaviorTree')
export class BehaviorTreeComponent extends Component {
    /** 行为树实例 */
    behaviorTree: BehaviorTree;

    /** 是否启用 */
    enabled: boolean = true;

    /** 黑板对象 */
    blackboard: Blackboard;

    /** 执行间隔（秒），0 表示每帧执行 */
    updateInterval: number = 0;

    /** 上次执行时间 */
    private lastUpdateTime: number = 0;

    /**
     * 初始化
     */
    onInit?(): void {
        if (!this.blackboard) {
            this.blackboard = new Blackboard();
        }
        // 绑定 Entity 数据
        this.blackboard.bindEntity(this.entityId!, 'Transform');
    }
}
```

#### System API

```typescript
/**
 * 行为树系统
 */
@System({
    name: 'BehaviorTreeSystem',
    priority: 100
})
export class BehaviorTreeSystem extends System {
    /**
     * 更新系统
     * @param deltaTime 时间差
     */
    update(deltaTime: number): void {
        const entities = this.world.query(BehaviorTreeComponent);
        
        for (const entity of entities) {
            const component = entity.get(BehaviorTreeComponent);
            if (!component.enabled || !component.behaviorTree) {
                continue;
            }

            // 检查执行间隔
            if (component.updateInterval > 0) {
                component.lastUpdateTime += deltaTime;
                if (component.lastUpdateTime < component.updateInterval) {
                    continue;
                }
                component.lastUpdateTime = 0;
            }

            // 执行行为树
            component.behaviorTree.execute(component.blackboard);
        }
    }
}
```

## 🔄 API 使用流程

### 1. 创建行为树

```typescript
// 方式 1: 使用构建器
const tree = new BehaviorTreeBuilder()
    .selector('root')
        .action('idle', () => NodeStatus.SUCCESS)
    .end()
    .build();

// 方式 2: 手动创建
const root = new SelectorNode('root');
root.addChild(new ActionNode('idle', () => NodeStatus.SUCCESS));
const tree = new BehaviorTree(root);
```

### 2. 添加到 Entity

```typescript
const entity = world.createEntity();
const component = entity.add(BehaviorTreeComponent);
component.behaviorTree = tree;
component.blackboard = new Blackboard();
```

### 3. 执行和调试

```typescript
// 手动执行
tree.execute(blackboard);

// 通过 System 自动执行（已注册）
// 无需手动调用
```

## ✅ 设计验证

### 易用性检查
- ✅ API 直观易懂
- ✅ 链式调用流畅
- ✅ 类型提示完整

### 灵活性检查
- ✅ 支持多种创建方式
- ✅ 易于扩展自定义节点
- ✅ 支持复杂场景

### 类型安全检查
- ✅ 完整的类型定义
- ✅ 泛型支持
- ✅ 编译时检查

### 一致性检查
- ✅ 与 ECS 系统风格一致
- ✅ 使用装饰器模式
- ✅ 遵循项目规范

---

**设计完成时间**: 2025-11-17  
**下一步**: 性能优化方案设计

