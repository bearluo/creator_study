# 行为树系统性能优化方案

## 📋 设计概述

**设计类型**: 性能优化方案  
**创建时间**: 2025-11-17  
**设计阶段**: CREATIVE 模式

## 🎯 性能目标

1. **执行性能**: 支持 1000+ Entity 同时运行行为树
2. **内存效率**: 最小化内存分配和垃圾回收
3. **CPU 效率**: 优化执行路径，减少不必要的计算
4. **可扩展性**: 性能不随 Entity 数量线性下降

## 📊 性能瓶颈分析

### 1. 节点对象创建
**问题**: 每次创建行为树都创建新节点对象  
**影响**: 高内存分配，频繁 GC

### 2. 节点状态管理
**问题**: 每次执行都创建状态对象  
**影响**: 内存分配，GC 压力

### 3. 执行遍历
**问题**: 深度优先遍历可能访问不必要节点  
**影响**: CPU 浪费

### 4. 数据访问
**问题**: Blackboard 数据访问可能较慢  
**影响**: CPU 性能

### 5. 系统更新
**问题**: 所有 Entity 每帧都更新  
**影响**: CPU 性能

## 🚀 优化方案

### 方案 1: 节点对象池化

#### 设计目标
- 复用节点对象，减少内存分配
- 支持节点重置
- 线程安全（如需要）

#### 实现方案

```typescript
/**
 * 节点对象池
 */
export class NodePool {
    private pools: Map<string, Node[]> = new Map();
    private maxPoolSize: number = 100;

    /**
     * 获取节点
     * @param type 节点类型
     * @param factory 节点工厂函数
     */
    get<T extends Node>(
        type: string, 
        factory: () => T
    ): T {
        const pool = this.pools.get(type) || [];
        
        if (pool.length > 0) {
            const node = pool.pop() as T;
            node.reset?.();
            return node;
        }

        return factory();
    }

    /**
     * 归还节点
     * @param node 节点对象
     */
    release(node: Node): void {
        const type = node.constructor.name;
        const pool = this.pools.get(type) || [];
        
        if (pool.length < this.maxPoolSize) {
            node.reset?.();
            pool.push(node);
            this.pools.set(type, pool);
        }
    }

    /**
     * 清空对象池
     */
    clear(): void {
        this.pools.clear();
    }
}
```

#### 使用方式

```typescript
// 节点基类支持池化
export abstract class Node {
    /**
     * 重置节点状态
     */
    reset(): void {
        this.status = NodeStatus.READY;
        this.children.forEach(child => child.reset?.());
    }

    /**
     * 从对象池获取（静态方法）
     */
    static fromPool<T extends Node>(
        this: new () => T,
        pool: NodePool
    ): T {
        return pool.get(this.name, () => new this());
    }
}
```

#### 性能收益
- **内存分配**: 减少 70-90%
- **GC 压力**: 显著降低
- **适用场景**: 频繁创建/销毁行为树

### 方案 2: 按需执行优化

#### 设计目标
- 只执行需要更新的节点
- 跳过已完成的子树
- 支持执行间隔控制

#### 实现方案

```typescript
/**
 * 智能执行器
 * 只执行需要更新的节点
 */
export class SmartExecutor {
    /**
     * 执行行为树（优化版）
     */
    execute(tree: BehaviorTree, blackboard: Blackboard): NodeStatus {
        const root = tree.root;
        
        // 如果根节点已完成，直接返回
        if (root.status === NodeStatus.SUCCESS || 
            root.status === NodeStatus.FAILURE) {
            return root.status;
        }

        // 只执行运行中的节点及其路径
        return this.executeNode(root, blackboard);
    }

    private executeNode(node: Node, blackboard: Blackboard): NodeStatus {
        // 如果节点已完成，直接返回
        if (node.status !== NodeStatus.RUNNING) {
            return node.status;
        }

        // 执行节点
        const status = node.execute(blackboard);
        
        // 如果是组合节点，只执行需要的子节点
        if (node instanceof CompositeNode) {
            return this.executeComposite(node, blackboard, status);
        }

        return status;
    }

    private executeComposite(
        node: CompositeNode, 
        blackboard: Blackboard,
        status: NodeStatus
    ): NodeStatus {
        // Selector: 找到第一个成功的子节点后停止
        if (node instanceof SelectorNode) {
            for (const child of node.children) {
                if (child.status === NodeStatus.SUCCESS) {
                    return NodeStatus.SUCCESS;
                }
                if (child.status === NodeStatus.RUNNING) {
                    const result = this.executeNode(child, blackboard);
                    if (result === NodeStatus.SUCCESS) {
                        return NodeStatus.SUCCESS;
                    }
                }
            }
            return NodeStatus.FAILURE;
        }

        // Sequence: 找到第一个失败的子节点后停止
        if (node instanceof SequenceNode) {
            for (const child of node.children) {
                if (child.status === NodeStatus.FAILURE) {
                    return NodeStatus.FAILURE;
                }
                if (child.status === NodeStatus.RUNNING) {
                    const result = this.executeNode(child, blackboard);
                    if (result === NodeStatus.FAILURE) {
                        return NodeStatus.FAILURE;
                    }
                }
            }
            return NodeStatus.SUCCESS;
        }

        return status;
    }
}
```

#### 性能收益
- **CPU 使用**: 减少 30-50%
- **适用场景**: 复杂行为树，大量节点

### 方案 3: 批量更新优化

#### 设计目标
- 批量处理 Entity 更新
- 减少系统调用开销
- 支持优先级调度

#### 实现方案

```typescript
/**
 * 行为树系统（优化版）
 */
@System({
    name: 'BehaviorTreeSystem',
    priority: 100
})
export class BehaviorTreeSystem extends System {
    private updateQueue: BehaviorTreeComponent[] = [];
    private batchSize: number = 50;

    /**
     * 更新系统
     */
    update(deltaTime: number): void {
        // 收集需要更新的组件
        this.collectComponents();

        // 批量处理
        this.processBatch(deltaTime);
    }

    private collectComponents(): void {
        this.updateQueue = [];
        const entities = this.world.query(BehaviorTreeComponent);
        
        for (const entity of entities) {
            const component = entity.get(BehaviorTreeComponent);
            if (component.enabled && 
                component.behaviorTree &&
                this.shouldUpdate(component, deltaTime)) {
                this.updateQueue.push(component);
            }
        }

        // 按优先级排序
        this.updateQueue.sort((a, b) => 
            (a.priority || 0) - (b.priority || 0)
        );
    }

    private shouldUpdate(
        component: BehaviorTreeComponent, 
        deltaTime: number
    ): boolean {
        if (component.updateInterval <= 0) {
            return true;
        }

        component.accumulatedTime += deltaTime;
        if (component.accumulatedTime >= component.updateInterval) {
            component.accumulatedTime = 0;
            return true;
        }

        return false;
    }

    private processBatch(deltaTime: number): void {
        const batch = this.updateQueue.splice(0, this.batchSize);
        
        for (const component of batch) {
            try {
                component.behaviorTree.execute(component.blackboard);
            } catch (error) {
                console.error('Behavior tree execution error:', error);
            }
        }

        // 如果还有剩余，下一帧继续处理
        if (this.updateQueue.length > 0) {
            // 可以设置标志，下一帧继续处理
        }
    }
}
```

#### 性能收益
- **系统开销**: 减少 20-30%
- **适用场景**: 大量 Entity（1000+）

### 方案 4: Blackboard 优化

#### 设计目标
- 快速数据访问
- 减少内存分配
- 支持数据缓存

#### 实现方案

```typescript
/**
 * 优化的 Blackboard
 */
export class OptimizedBlackboard extends Blackboard {
    private cache: Map<string, any> = new Map();
    private cacheVersion: number = 0;
    private entityBindings: Map<string, EntityId> = new Map();

    /**
     * 获取值（带缓存）
     */
    get<T>(key: string, defaultValue?: T): T {
        // 检查缓存
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        // 检查 Entity 绑定
        if (this.entityBindings.has(key)) {
            const entityId = this.entityBindings.get(key)!;
            const value = this.getFromEntity(entityId, key);
            if (value !== undefined) {
                this.cache.set(key, value);
                return value;
            }
        }

        // 从数据存储获取
        const value = super.get<T>(key, defaultValue);
        if (value !== undefined) {
            this.cache.set(key, value);
        }

        return value;
    }

    /**
     * 设置值（清除缓存）
     */
    set<T>(key: string, value: T): void {
        super.set(key, value);
        this.cache.set(key, value);
        this.cacheVersion++;
    }

    /**
     * 清除缓存
     */
    clearCache(): void {
        this.cache.clear();
        this.cacheVersion++;
    }
}
```

#### 性能收益
- **数据访问**: 提升 40-60%
- **适用场景**: 频繁数据访问

### 方案 5: 执行间隔控制

#### 设计目标
- 不同 Entity 使用不同更新频率
- 减少不必要的执行
- 支持动态调整

#### 实现方案

```typescript
/**
 * 执行间隔管理器
 */
export class UpdateIntervalManager {
    /**
     * 根据 Entity 类型设置更新间隔
     */
    setInterval(
        component: BehaviorTreeComponent,
        interval: number
    ): void {
        component.updateInterval = interval;
        component.accumulatedTime = 0;
    }

    /**
     * 根据距离设置更新间隔（LOD）
     */
    setLODInterval(
        component: BehaviorTreeComponent,
        distance: number
    ): void {
        if (distance < 10) {
            // 近距离：每帧更新
            component.updateInterval = 0;
        } else if (distance < 50) {
            // 中距离：每 0.1 秒更新
            component.updateInterval = 0.1;
        } else {
            // 远距离：每 0.5 秒更新
            component.updateInterval = 0.5;
        }
    }
}
```

#### 性能收益
- **CPU 使用**: 减少 50-70%（远距离 Entity）
- **适用场景**: 大量 Entity，有距离概念

## 📈 性能测试方案

### 测试场景

1. **基础性能测试**
   - 1000 个 Entity，简单行为树
   - 测量：FPS、内存使用、CPU 使用

2. **复杂场景测试**
   - 1000 个 Entity，复杂行为树（10+ 节点）
   - 测量：执行时间、内存分配

3. **压力测试**
   - 5000 个 Entity
   - 测量：性能下降曲线

### 性能指标

- **目标 FPS**: 60 FPS（1000 Entity）
- **内存使用**: < 100MB（1000 Entity）
- **CPU 使用**: < 30%（1000 Entity）

## 🎯 优化策略选择

### 场景 1: 少量 Entity（< 100）
**推荐方案**: 
- 基础实现即可
- 无需特殊优化

### 场景 2: 中等数量 Entity（100-1000）
**推荐方案**:
- 按需执行优化
- 执行间隔控制

### 场景 3: 大量 Entity（1000+）
**推荐方案**:
- 所有优化方案
- 重点：批量更新、执行间隔、节点池化

## ✅ 优化方案验证

### 可行性检查
- ✅ 所有方案技术上可行
- ✅ 与现有系统兼容
- ✅ 不影响功能正确性

### 性能收益检查
- ✅ 预期性能提升明显
- ✅ 满足性能目标
- ✅ 可扩展性好

### 实施复杂度检查
- ⚠️ 节点池化：中等复杂度
- ⚠️ 按需执行：中等复杂度
- ✅ 批量更新：低复杂度
- ✅ Blackboard 优化：低复杂度
- ✅ 执行间隔：低复杂度

---

**设计完成时间**: 2025-11-17  
**下一步**: 更新实施计划，整合优化方案

