import { ComponentType, EntityId, Component, World, Handle } from '../index';

/**
 * 实体类
 * 实体是一个唯一的标识符，可以附加多个组件
 */
export class Entity {
    /** 实体唯一ID */
    private _id: EntityId;

    /** 实体是否激活 */
    private _active: boolean = true;

    /** 实体名称（用于调试） */
    public name: string = '';

    /** 所属世界 */
    public world!: World;

    constructor(id: EntityId) {
        this._id = id;
    }

    /** 获取实体ID */
    get id(): EntityId {
        return this._id;
    }

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
     * 
     * @returns 实体句柄，如果实体无效（无 world 或已销毁）返回 undefined
     */
    get handle(): Handle | undefined {
        if (!this.world) {
            return undefined;
        }
        return this.world.createHandle(this._id);
    }

    /** 获取激活状态 */
    get active(): boolean {
        return this._active;
    }

    /** 设置激活状态 */
    set active(value: boolean) {
        this._active = value;
    }

    /** 销毁标记 */
    private _destroyed: boolean = false;

    /** 是否已销毁 */
    get destroyed(): boolean {
        return this._destroyed;
    }

    /** 标记为已销毁 */
    markDestroyed(): void {
        this._destroyed = true;
        this._active = false;
    }

    /** 重置实体状态（对象池使用） */
    reset(id: EntityId): void {
        this._id = id;
        this._active = true;
        this._destroyed = false;
        this.name = '';
    }

    getComponent<T extends Component>(componentType: ComponentType<T>): T | undefined {
        return this.world?.getComponent<T>(this._id, componentType);
    }

    addComponent<T extends Component>(componentType: ComponentType<T>): T {
        return this.world?.addComponent<T>(this._id, componentType);
    }

    getOrCreateComponent<T extends Component>(componentType: ComponentType<T>): T {
        return this.world?.getComponent<T>(this._id, componentType) ?? this.addComponent<T>(componentType);
    }
}

