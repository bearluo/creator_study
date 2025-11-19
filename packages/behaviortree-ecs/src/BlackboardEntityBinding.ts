/**
 * Blackboard Entity 绑定扩展
 * 为 Blackboard 添加 Entity 数据绑定功能
 */

import { ComponentType, EntityId, IComponent } from '@bl-framework/ecs';
import { Blackboard } from '@bl-framework/behaviortree';

/**
 * Entity 绑定信息
 */
interface EntityBinding {
    entityId: EntityId;
    componentType: ComponentType<IComponent>;
    propertyKey: string;
}

/**
 * Entity 数据访问器类型
 */
type EntityAccessor = (entityId: EntityId, componentType: ComponentType<IComponent>, propertyKey: string) => any;

/**
 * Blackboard Entity 绑定扩展
 * 为 Blackboard 添加 Entity 数据绑定功能
 */
export class BlackboardEntityBinding {
    private blackboard: Blackboard;
    private entityBindings: Map<string, EntityBinding> = new Map();
    private entityAccessor?: EntityAccessor;

    constructor(blackboard: Blackboard) {
        this.blackboard = blackboard;
    }

    /**
     * 绑定 Entity 的 Component 属性到数据键
     * @param entityId Entity ID
     * @param componentType 组件类型
     * @param propertyKey 组件属性名
     * @param dataKey 数据键（可选，默认使用 propertyKey）
     */
    bindEntity<T extends IComponent>(
        entityId: EntityId,
        componentType: ComponentType<T>,
        propertyKey: string,
        dataKey?: string
    ): void {
        const key = dataKey || propertyKey;
        this.entityBindings.set(key, {
            entityId,
            componentType,
            propertyKey
        });
    }

    /**
     * 绑定 Entity 的 Component 属性到指定的数据键
     * @param entityId Entity ID
     * @param componentType 组件类型
     * @param propertyKey 组件属性名
     * @param dataKey 数据键
     */
    bindEntityProperty<T extends IComponent>(
        entityId: EntityId,
        componentType: ComponentType<T>,
        propertyKey: string,
        dataKey: string
    ): void {
        this.entityBindings.set(dataKey, {
            entityId,
            componentType,
            propertyKey
        });
    }

    /**
     * 设置 Entity 数据访问器
     * @param accessor 数据访问器函数
     */
    setEntityAccessor(accessor: EntityAccessor): void {
        this.entityAccessor = accessor;
    }

    /**
     * 获取值（支持 Entity 绑定）
     * @param key 键
     * @param defaultValue 默认值
     * @returns 值
     */
    get<T>(key: string, defaultValue?: T): T {
        // 先尝试从 Blackboard 获取
        if (this.blackboard.has(key)) {
            return this.blackboard.get(key, defaultValue);
        }

        // 检查 Entity 绑定
        if (this.entityBindings.has(key) && this.entityAccessor) {
            const binding = this.entityBindings.get(key)!;
            const value = this.entityAccessor(
                binding.entityId,
                binding.componentType,
                binding.propertyKey
            );
            if (value !== undefined) {
                return value;
            }
        }

        return defaultValue as T;
    }

    /**
     * 检查是否存在（包括 Entity 绑定）
     * @param key 键
     * @returns 是否存在
     */
    has(key: string): boolean {
        return this.blackboard.has(key) || this.entityBindings.has(key);
    }

    /**
     * 清空所有 Entity 绑定
     */
    clearBindings(): void {
        this.entityBindings.clear();
    }

    /**
     * 获取底层 Blackboard 实例
     * @returns Blackboard 实例
     */
    getBlackboard(): Blackboard {
        return this.blackboard;
    }
}



