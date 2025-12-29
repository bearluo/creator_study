# CREATIVE PHASE: ECS 实体异步安全 API 设计

📌 CREATIVE PHASE START: Entity Async Safety API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1️⃣ PROBLEM

**Description**: 设计便捷的 API 让开发者能够安全地在异步操作中使用实体，避免实体复用导致的数据混乱问题。

**Requirements**:
- 提供简单易用的 API（`entity.handle`）
- 类型安全，完整的 TypeScript 支持
- 性能开销小（< 1%）
- 向后兼容，不影响现有代码
- 提供辅助函数支持函数式编程风格

**Constraints**:
- 必须保持现有 Handle 机制不变
- Entity 对象不存储 Generation
- API 要直观，符合开发者直觉
- 不能增加 Entity 类的内存占用

## 2️⃣ OPTIONS

### Option A: Entity.handle Getter（主要方案）
**实现**：
```typescript
class Entity {
    get handle(): Handle | undefined {
        if (!this.world) return undefined;
        return this.world.createHandle(this._id);
    }
}
```

**特点**：
- 属性访问器，使用简单
- 自动处理 world 不存在的情况
- 符合直觉：`const handle = entity.handle;`

### Option B: Entity.getHandle() 方法
**实现**：
```typescript
class Entity {
    getHandle(): Handle | undefined {
        if (!this.world) return undefined;
        return this.world.createHandle(this._id);
    }
}
```

**特点**：
- 显式方法调用
- 更明确的意图表达
- 可以添加参数（如错误处理选项）

### Option C: 独立工具函数
**实现**：
```typescript
// utils/entityHandle.ts
export function createEntityHandle(entity: Entity): Handle | undefined
export function getEntityByHandle(world: World, handle: Handle): Entity | undefined
export function isValidHandle(world: World, handle: Handle): boolean
```

**特点**：
- 函数式编程风格
- 不修改 Entity 类
- 易于测试和组合

### Option D: 组合方案（推荐）
**实现**：结合 Option A + Option C
- Entity.handle getter（主要 API）
- 辅助函数（函数式 API）
- 两者都提供，让开发者选择

## 3️⃣ ANALYSIS

| Criterion | Option A (Getter) | Option B (Method) | Option C (Functions) | Option D (Combined) |
|-----------|------------------|-------------------|---------------------|---------------------|
| **易用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **类型安全** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **灵活性** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **向后兼容** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **可测试性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **函数式支持** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Key Insights**:
- Getter 最易用，符合直觉
- 方法调用更明确，但稍显冗长
- 工具函数最灵活，支持函数式编程
- 组合方案提供最佳开发者体验

## 4️⃣ DECISION

**Selected**: Option D - 组合方案

**Rationale**: 
- 提供多种使用方式，满足不同开发风格
- Entity.handle getter 作为主要 API，简单直观
- 辅助函数提供函数式编程支持
- 两者互补，不冲突

**Implementation Strategy**:
1. **Entity.handle getter** - 主要 API，最常用
2. **辅助函数** - 函数式 API，工具函数
3. **两者都导出** - 让开发者自由选择

## 5️⃣ IMPLEMENTATION NOTES

### Entity.handle Getter 实现

```typescript
/**
 * 获取实体句柄（用于异步操作）
 * 
 * ⚠️ 重要：在异步操作中，应该保存 Handle 而不是 Entity 对象引用
 * 
 * @example
 * ```typescript
 * const entity = world.createEntity();
 * const handle = entity.handle; // 保存 Handle
 * 
 * await someAsyncOperation();
 * 
 * const currentEntity = world.getEntityByHandle(handle);
 * if (currentEntity) {
 *     // 实体仍然有效
 * }
 * ```
 */
get handle(): Handle | undefined {
    if (!this.world) {
        return undefined;
    }
    return this.world.createHandle(this._id);
}
```

**设计要点**:
- 返回 `Handle | undefined`，处理 world 不存在的情况
- 添加详细的 JSDoc 注释和示例
- 性能：O(1) Map 查找，开销极小

### 辅助函数实现

**文件**: `packages/ecs/src/utils/entityHandle.ts`

```typescript
/**
 * 创建实体句柄
 * @param entity 实体对象
 * @returns 实体句柄，如果实体无效返回 undefined
 */
export function createEntityHandle(entity: Entity): Handle | undefined {
    return entity.handle;
}

/**
 * 通过句柄获取实体（带有效性验证）
 * @param world World 实例
 * @param handle 实体句柄
 * @returns 如果实体存在且有效则返回实体，否则返回 undefined
 */
export function getEntityByHandle(world: World, handle: Handle): Entity | undefined {
    return world.getEntityByHandle(handle);
}

/**
 * 验证句柄是否有效
 * @param world World 实例
 * @param handle 实体句柄
 * @returns 如果实体存在且 Generation 匹配返回 true
 */
export function isValidHandle(world: World, handle: Handle): boolean {
    return world.isValidHandle(handle);
}
```

**设计要点**:
- 函数式 API，易于组合
- 类型安全，完整的 TypeScript 支持
- 简洁明了，易于理解

### 导出策略

**index.ts**:
```typescript
// 导出辅助函数
export {
    createEntityHandle,
    getEntityByHandle,
    isValidHandle,
} from './utils/entityHandle';

// 添加到 ECS 命名空间
export const ECS = {
    // ... 现有导出
    createEntityHandle,
    getEntityByHandle,
    isValidHandle,
} as const;
```

### 类型定义增强

**可选：添加辅助类型**
```typescript
/**
 * 实体句柄验证结果
 */
export interface HandleValidationResult {
    valid: boolean;
    entity?: Entity;
    reason?: 'not_found' | 'generation_mismatch';
}
```

### 运行时检查（可选）

**开发模式下的警告**:
```typescript
// 仅在开发模式下启用
if (process.env.NODE_ENV === 'development') {
    // 可以添加 ESLint 规则建议
    // 或运行时检测 Entity 对象在异步操作中的使用
}
```

**实现方式**:
- 通过 TypeScript 类型提示
- 通过 JSDoc 警告
- 可选：运行时检测（性能影响较大，不推荐）

## 6️⃣ API 设计细节

### Entity.handle Getter

**签名**:
```typescript
get handle(): Handle | undefined
```

**行为**:
- 如果 world 不存在，返回 `undefined`
- 如果实体已销毁，返回 `undefined`（通过 world.createHandle 处理）
- 否则返回有效的 Handle

**性能**: O(1) - Map 查找

### 辅助函数

**createEntityHandle**:
- 输入: `Entity`
- 输出: `Handle | undefined`
- 等价于: `entity.handle`

**getEntityByHandle**:
- 输入: `World, Handle`
- 输出: `Entity | undefined`
- 等价于: `world.getEntityByHandle(handle)`

**isValidHandle**:
- 输入: `World, Handle`
- 输出: `boolean`
- 等价于: `world.isValidHandle(handle)`

## 7️⃣ 使用示例设计

### 示例 1: Promise 链
```typescript
const entity = world.createEntity();
const handle = entity.handle; // ✅ 使用 getter

fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        const currentEntity = world.getEntityByHandle(handle);
        if (currentEntity) {
            currentEntity.addComponent(DataComponent).data = data;
        }
    });
```

### 示例 2: 函数式风格
```typescript
import { createEntityHandle, getEntityByHandle } from '@bl-framework/ecs';

const entity = world.createEntity();
const handle = createEntityHandle(entity); // ✅ 使用函数

await someAsyncOperation();

const currentEntity = getEntityByHandle(world, handle);
if (currentEntity) {
    // 处理实体
}
```

### 示例 3: 批量操作
```typescript
const entities = [world.createEntity(), world.createEntity()];
const handles = entities
    .map(e => e.handle)
    .filter((h): h is Handle => h !== undefined);

await Promise.all(handles.map(async (handle) => {
    await someAsyncWork();
    const entity = world.getEntityByHandle(handle);
    if (entity) {
        entity.addComponent(ProcessedComponent);
    }
}));
```

## 8️⃣ 错误处理设计

### 场景 1: World 不存在
```typescript
const entity = new Entity(1); // 没有设置 world
const handle = entity.handle; // 返回 undefined
```

### 场景 2: 实体已销毁
```typescript
const entity = world.createEntity();
const handle = entity.handle;
world.destroyEntity(entity.id);
const currentEntity = world.getEntityByHandle(handle); // 返回 undefined
```

### 场景 3: Handle 无效
```typescript
const handle = { id: 1, gen: 1 }; // 旧的 Handle
const entity = world.getEntityByHandle(handle); // 返回 undefined（Generation 不匹配）
```

## 9️⃣ 性能考虑

### Getter 性能
- **开销**: O(1) Map 查找
- **内存**: 无额外内存占用（Handle 是值类型）
- **影响**: < 0.1%

### 辅助函数性能
- **开销**: 与直接调用相同
- **内存**: 无额外内存占用
- **影响**: 可忽略

## 🔟 向后兼容性

### 现有代码
- ✅ 不修改任何现有 API
- ✅ 只添加新 API
- ✅ 现有代码继续工作

### 迁移路径
- 开发者可以选择使用新 API
- 旧代码无需修改
- 逐步迁移到新 API

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CREATIVE PHASE END

## VERIFICATION

- [x] Problem clearly defined
- [x] Multiple options considered
- [x] Analysis table completed
- [x] Decision made with rationale
- [x] Implementation guidance provided
- [x] API design detailed
- [x] Examples provided
- [x] Performance considered
- [x] Backward compatibility ensured
