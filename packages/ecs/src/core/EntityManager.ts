import { Entity } from './Entity';
import { EntityId, Gen, Handle } from '../index';

/**
 * 实体管理器
 * 负责实体的创建、销毁和生命周期管理
 * 
 * Generation 机制：
 * - EntityManager 维护每个实体 ID 的 Generation
 * - Entity 对象不存储 Generation（可以安全复用）
 * - 通过 Handle (id + gen) 验证实体有效性
 * - 异步操作应该持有 Handle 而不是 Entity 对象引用
 */
export class EntityManager {
    /** 实体映射表 */
    private entities: Map<EntityId, Entity> = new Map();

    /** Generation 映射表 (EntityId -> Generation) */
    private generations: Map<EntityId, Gen> = new Map();

    /** 下一个实体ID */
    private nextEntityId: EntityId = 1;

    /** 待回收的实体ID队列 */
    private recycledIds: EntityId[] = [];

    /** 实体对象池 */
    private entityPool: Entity[] = [];

    /** 实体池大小 */
    private poolSize: number;

    constructor(initialPoolSize: number = 1000) {
        this.poolSize = initialPoolSize;

        // 预创建实体对象池
        for (let i = 0; i < initialPoolSize; i++) {
            this.entityPool.push(new Entity(0));
        }
    }

    /**
     * 创建实体
     */
    createEntity(name?: string): Entity {
        // 优先使用回收的ID
        const id =
            this.recycledIds.length > 0
                ? this.recycledIds.pop()!
                : this.nextEntityId++;

        // 递增 Generation
        const currentGen = this.generations.get(id) || 0;
        const newGen = currentGen + 1;
        this.generations.set(id, newGen);

        // 从对象池获取实体
        let entity: Entity;
        if (this.entityPool.length > 0) {
            entity = this.entityPool.pop()!;
            entity.reset(id);
        } else {
            entity = new Entity(id);
        }

        if (name) {
            entity.name = name;
        }
        
        this.entities.set(id, entity);
        return entity;
    }

    /**
     * 获取实体
     */
    getEntity(entityId: EntityId): Entity | undefined {
        return this.entities.get(entityId);
    }

    /**
     * 创建实体句柄
     * @param entityId 实体ID
     * @returns 实体句柄，如果实体不存在返回 undefined
     */
    createHandle(entityId: EntityId): Handle | undefined {
        if (!this.entities.has(entityId)) {
            return undefined;
        }
        const gen = this.generations.get(entityId);
        if (gen === undefined) {
            return undefined;
        }
        return { id: entityId, gen };
    }

    /**
     * 通过句柄获取实体（带有效性验证）
     * @param handle 实体句柄
     * @returns 如果实体存在且 Generation 匹配则返回实体，否则返回 undefined
     */
    getEntityByHandle(handle: Handle): Entity | undefined {
        const entity = this.entities.get(handle.id);
        if (!entity) {
            return undefined;
        }

        // 验证 Generation
        const currentGen = this.generations.get(handle.id);
        if (currentGen !== handle.gen) {
            return undefined; // Generation 不匹配，实体已被复用
        }

        return entity;
    }

    /**
     * 验证句柄是否有效
     * @param handle 实体句柄
     * @returns 如果实体存在且 Generation 匹配返回 true
     */
    isValidHandle(handle: Handle): boolean {
        if (!this.entities.has(handle.id)) {
            return false;
        }
        const currentGen = this.generations.get(handle.id);
        return currentGen === handle.gen;
    }

    /**
     * 获取实体的当前 Generation
     * @param entityId 实体ID
     * @returns Generation 值，如果实体不存在返回 undefined
     */
    getGeneration(entityId: EntityId): Gen | undefined {
        if (!this.entities.has(entityId)) {
            return undefined;
        }
        return this.generations.get(entityId);
    }

    /**
     * 检查实体是否存在
     */
    hasEntity(entityId: EntityId): boolean {
        return this.entities.has(entityId);
    }

    /**
     * 销毁实体
     * 注意：Generation 保留不删除，在下次创建时会递增
     */
    destroyEntity(entityId: EntityId): boolean {
        const entity = this.entities.get(entityId);
        if (!entity) return false;

        // 标记为已销毁
        entity.markDestroyed();

        // 从映射表移除（但保留 Generation）
        this.entities.delete(entityId);

        // 回收ID（用于下次复用）
        this.recycledIds.push(entityId);

        // 归还到对象池
        if (this.entityPool.length < this.poolSize) {
            this.entityPool.push(entity);
        }

        return true;
    }

    /**
     * 获取所有实体
     */
    getAllEntities(): Entity[] {
        return Array.from(this.entities.values());
    }

    /**
     * 获取所有激活的实体
     */
    getActiveEntities(): Entity[] {
        return Array.from(this.entities.values()).filter((e) => e.active);
    }

    /**
     * 获取实体数量
     */
    getEntityCount(): number {
        return this.entities.size;
    }

    /**
     * 清空所有实体
     */
    clear(): void {
        // 归还所有实体到对象池
        for (const entity of this.entities.values()) {
            entity.markDestroyed();
            if (this.entityPool.length < this.poolSize) {
                this.entityPool.push(entity);
            }
        }

        this.entities.clear();
        this.recycledIds = [];
        // 注意：不清空 generations，保持 Generation 历史
    }

    /**
     * 销毁管理器
     */
    destroy(): void {
        this.clear();
        this.entityPool = [];
        this.generations.clear();
    }
}

