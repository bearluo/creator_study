import { Entity, World, Handle } from '../index';

/**
 * 创建实体句柄
 * 
 * 这是一个辅助函数，提供函数式编程风格的 API。
 * 等价于 `entity.handle` getter。
 * 
 * @param entity 实体对象
 * @returns 实体句柄，如果实体无效返回 undefined
 * 
 * @example
 * ```typescript
 * const entity = world.createEntity();
 * const handle = createEntityHandle(entity);
 * 
 * await someAsyncOperation();
 * 
 * const currentEntity = getEntityByHandle(world, handle);
 * if (currentEntity) {
 *     // 实体仍然有效
 * }
 * ```
 */
export function createEntityHandle(entity: Entity): Handle | undefined {
    return entity.handle;
}

/**
 * 通过句柄获取实体（带有效性验证）
 * 
 * 这是一个辅助函数，提供函数式编程风格的 API。
 * 等价于 `world.getEntityByHandle(handle)`。
 * 
 * @param world World 实例
 * @param handle 实体句柄
 * @returns 如果实体存在且有效则返回实体，否则返回 undefined
 * 
 * @example
 * ```typescript
 * const handle = entity.handle;
 * await someAsyncOperation();
 * 
 * const entity = getEntityByHandle(world, handle);
 * if (entity) {
 *     // 实体仍然有效
 * }
 * ```
 */
export function getEntityByHandle(world: World, handle: Handle): Entity | undefined {
    return world.getEntityByHandle(handle);
}

/**
 * 验证句柄是否有效
 * 
 * 这是一个辅助函数，提供函数式编程风格的 API。
 * 等价于 `world.isValidHandle(handle)`。
 * 
 * @param world World 实例
 * @param handle 实体句柄
 * @returns 如果实体存在且 Generation 匹配返回 true
 * 
 * @example
 * ```typescript
 * const handle = entity.handle;
 * await someAsyncOperation();
 * 
 * if (isValidHandle(world, handle)) {
 *     const entity = getEntityByHandle(world, handle);
 *     // 安全地使用实体
 * }
 * ```
 */
export function isValidHandle(world: World, handle: Handle): boolean {
    return world.isValidHandle(handle);
}
