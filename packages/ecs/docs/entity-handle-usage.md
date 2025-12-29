# Entity Handle 使用指南

## 设计原理

### Generation 机制

ECS 框架在 **EntityManager** 中维护 Generation，但 **Entity 对象本身不存储 Generation**。

**关键设计：**
- ✅ EntityManager 维护 `Map<EntityId, Gen>`
- ✅ Entity 对象可以安全复用（不存储 Generation）
- ✅ 通过 `Handle { id, gen }` 验证实体有效性
- ✅ 异步操作持有 Handle，不持有 Entity 对象引用

## 问题场景

```typescript
// ❌ 错误：持有 Entity 对象引用
const entity = world.createEntity();

someAsyncOperation().then(() => {
    // 危险！entity 对象可能已被复用
    // 即使 entity.id 相同，可能代表不同的实体
    entity.addComponent(SomeComponent);
});
```

**问题：**
1. Entity 对象被对象池复用
2. 异步操作完成时，对象可能代表不同的实体
3. 无法检测对象是否被复用

## 解决方案：使用 Handle

### 1. 创建 Handle

```typescript
const entity = world.createEntity();
const handle = world.createHandle(entity.id);
// handle = { id: 1, gen: 1 }
```

### 2. 在异步操作中使用 Handle

```typescript
const entity = world.createEntity();
const handle = world.createHandle(entity.id)!;

await someAsyncOperation();

// ✅ 安全：通过 Handle 验证
const currentEntity = world.getEntityByHandle(handle);
if (currentEntity) {
    // 实体仍然有效
    currentEntity.addComponent(SomeComponent);
} else {
    // 实体已被销毁或复用
    console.log('实体已失效');
}
```

## API 参考

### Entity 类

#### `handle: Handle | undefined`（推荐）
获取实体句柄的 getter

```typescript
const entity = world.createEntity();
const handle = entity.handle; // 最简单的方式
```

**特点**：
- 使用最简单：直接属性访问
- 自动处理 world 不存在的情况
- 性能：O(1) Map 查找

### World 类

#### `createHandle(entityId: EntityId): Handle | undefined`
创建实体句柄

```typescript
const entity = world.createEntity();
const handle = world.createHandle(entity.id);
```

#### `getEntityByHandle(handle: Handle): Entity | undefined`
通过 Handle 获取实体（带验证）

```typescript
const entity = world.getEntityByHandle(handle);
if (entity) {
    // 实体有效
}
```

#### `isValidHandle(handle: Handle): boolean`
验证 Handle 是否有效

```typescript
if (world.isValidHandle(handle)) {
    // Handle 有效
}
```

### 辅助函数（函数式 API）

#### `createEntityHandle(entity: Entity): Handle | undefined`
创建实体句柄（函数式风格）

```typescript
import { createEntityHandle } from '@bl-framework/ecs';

const handle = createEntityHandle(entity);
```

#### `getEntityByHandle(world: World, handle: Handle): Entity | undefined`
通过 Handle 获取实体（函数式风格）

```typescript
import { getEntityByHandle } from '@bl-framework/ecs';

const entity = getEntityByHandle(world, handle);
```

#### `isValidHandle(world: World, handle: Handle): boolean`
验证 Handle 是否有效（函数式风格）

```typescript
import { isValidHandle } from '@bl-framework/ecs';

if (isValidHandle(world, handle)) {
    // Handle 有效
}
```

### EntityManager 类

#### `createHandle(entityId: EntityId): Handle | undefined`
创建句柄

#### `getEntityByHandle(handle: Handle): Entity | undefined`
通过句柄获取实体

#### `isValidHandle(handle: Handle): boolean`
验证句柄有效性

#### `getGeneration(entityId: EntityId): Gen | undefined`
获取实体的当前 Generation

## 使用示例

### 示例 1: Promise 异步操作（使用 Entity.handle）

```typescript
async function loadDataForEntity(world: World, entity: Entity) {
    // ✅ 使用 Entity.handle getter
    const handle = entity.handle;
    if (!handle) {
        console.error('无法创建 Handle');
        return;
    }

    // 异步加载数据
    const data = await fetch('/api/data').then(r => r.json());

    // 验证实体是否仍然有效
    const currentEntity = world.getEntityByHandle(handle);
    if (currentEntity) {
        currentEntity.addComponent(DataComponent).data = data;
    } else {
        console.warn('实体在异步操作期间被销毁');
    }
}
```

### 示例 1b: 使用辅助函数（函数式风格）

```typescript
import { createEntityHandle, getEntityByHandle } from '@bl-framework/ecs';

async function loadDataForEntity(world: World, entity: Entity) {
    // ✅ 使用辅助函数
    const handle = createEntityHandle(entity);
    if (!handle) {
        console.error('无法创建 Handle');
        return;
    }

    // 异步加载数据
    const data = await fetch('/api/data').then(r => r.json());

    // 验证实体是否仍然有效
    const currentEntity = getEntityByHandle(world, handle);
    if (currentEntity) {
        currentEntity.addComponent(DataComponent).data = data;
    } else {
        console.warn('实体在异步操作期间被销毁');
    }
}
```

### 示例 2: 定时器操作

```typescript
function scheduleEntityUpdate(world: World, entity: Entity) {
    // ✅ 使用 Entity.handle getter
    const handle = entity.handle;
    if (!handle) return;

    setTimeout(() => {
        const currentEntity = world.getEntityByHandle(handle);
        if (currentEntity) {
            // 更新实体
            currentEntity.addComponent(UpdateComponent);
        }
    }, 1000);
}
```

### 示例 3: 事件回调

```typescript
class EntityEventSystem {
    private pendingHandles = new Map<string, Handle>();

    registerEvent(world: World, entity: Entity, eventId: string) {
        // ✅ 使用 Entity.handle getter
        const handle = entity.handle;
        if (handle) {
            this.pendingHandles.set(eventId, handle);
        }
    }

    onEventTriggered(world: World, eventId: string) {
        const handle = this.pendingHandles.get(eventId);
        if (!handle) return;

        const entity = world.getEntityByHandle(handle);
        if (entity) {
            // 处理事件
            console.log('事件触发，实体有效:', entity.id);
        } else {
            console.log('实体已失效，清理事件');
            this.pendingHandles.delete(eventId);
        }
    }
}
```

### 示例 4: 批量异步操作

```typescript
async function processBatchEntities(world: World, entities: Entity[]) {
    // ✅ 使用 Entity.handle getter
    const handles = entities
        .map(e => e.handle)
        .filter((h): h is Handle => h !== undefined);

    // 执行异步操作
    await Promise.all(
        handles.map(async (handle) => {
            await someAsyncWork();

            const entity = world.getEntityByHandle(handle);
            if (entity) {
                // 处理实体
                entity.addComponent(ProcessedComponent);
            }
        })
    );
}
```

## 最佳实践

### ✅ 推荐做法

1. **使用 Entity.handle getter（最简单）**
   ```typescript
   const entity = world.createEntity();
   const handle = entity.handle; // ✅ 最简单的方式
   await asyncOp();
   const entity = world.getEntityByHandle(handle);
   ```

2. **使用辅助函数（函数式风格）**
   ```typescript
   import { createEntityHandle, getEntityByHandle } from '@bl-framework/ecs';
   
   const handle = createEntityHandle(entity);
   await asyncOp();
   const entity = getEntityByHandle(world, handle);
   ```

3. **检查 Handle 有效性**
   ```typescript
   if (world.isValidHandle(handle)) {
       const entity = world.getEntityByHandle(handle);
   }
   ```

4. **存储 Handle 而不是 Entity**
   ```typescript
   class AsyncTaskManager {
       private tasks = new Map<string, Handle>();
   }
   ```

### ❌ 不推荐做法

1. **不要在异步操作中持有 Entity 对象**
   ```typescript
   // ❌ 错误
   const entity = world.createEntity();
   await asyncOp();
   entity.addComponent(Component); // 危险！对象可能已被复用
   ```

2. **不要假设 Entity ID 唯一**
   ```typescript
   // ❌ 错误：ID 可能被复用
   const entityId = entity.id;
   await asyncOp();
   const entity = world.getEntity(entityId); // 可能是不同的实体！
   ```

## Generation 工作原理

### 创建实体

```typescript
// 第一次创建 ID=1 的实体
const entity1 = world.createEntity();
// EntityManager: generations.set(1, 1)
// Handle: { id: 1, gen: 1 }
```

### 销毁和复用

```typescript
// 销毁实体
world.destroyEntity(entity1.id);
// EntityManager: generations 保持 (1, 1)
// Entity 对象归还到对象池

// 创建新实体，复用 ID=1
const entity2 = world.createEntity();
// EntityManager: generations.set(1, 2) // Generation 递增
// Handle: { id: 1, gen: 2 }
```

### 验证有效性

```typescript
const oldHandle = { id: 1, gen: 1 };
const newHandle = { id: 1, gen: 2 };

world.isValidHandle(oldHandle); // false (Generation 不匹配)
world.isValidHandle(newHandle); // true (Generation 匹配)
```

## 性能考虑

- **内存开销**：每个实体 ID 额外存储一个数字（Gen）
- **验证开销**：Map 查找 + 数值比较，O(1) 复杂度
- **对象池性能**：不受影响，Entity 对象仍然可以复用

## 注意事项

1. Handle 是只读的，不要修改
2. Generation 自动管理，无需手动操作
3. Entity 对象不存储 Generation，安全复用
4. 始终在异步操作中使用 Handle 验证

## 总结

**核心原则：**
- 🎯 Entity 不存储 Generation
- 🎯 EntityManager 管理 Generation
- 🎯 异步操作使用 Handle
- 🎯 通过 Handle 验证实体有效性
