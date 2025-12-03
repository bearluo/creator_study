/**
 * @bl-framework/ecs
 * 
 * Entity-Component-System framework for bl-framework
 * 
 * 所有导出打包成一个对象 ECS
 */

// ==================== 类型定义 ====================

/** 实体ID类型 */
export type EntityId = number;

/** 组件类型 */
export type ComponentType<T = any> = new (...args: any[]) => T;

/** 组件类型ID */
export type ComponentTypeId = number;

/** 系统优先级 */
export type SystemPriority = number;

/** 查询配置 */
export interface QueryConfig {
    /** 必须包含的组件 */
    all?: ComponentType[];
    /** 至少包含一个的组件 */
    any?: ComponentType[];
    /** 不能包含的组件 */
    none?: ComponentType[];
}

/** 实体快照 */
export interface EntitySnapshot {
    id: EntityId;
    components: Map<ComponentTypeId, any>;
}

/** World配置 */
export interface WorldConfig {
    /** 初始实体池大小 */
    initialEntityPoolSize?: number;
    /** 组件池大小 */
    componentPoolSize?: number;
    /** 是否启用调试模式 */
    debug?: boolean;
}

// ==================== 核心模块 ====================

// 导出核心类
export { Entity } from './core/Entity';
export { Component } from './core/Component';
export { System } from './core/System';
export { World } from './core/World';
export { Query } from './core/Query';
export { ComponentManager } from './core/ComponentManager';
export { EntityManager } from './core/EntityManager';
export { SystemManager } from './core/SystemManager';

// ==================== 装饰器 ====================

export {
    component,
    getComponentMetadata,
} from './decorators/component';
export type { ComponentDecoratorConfig } from './decorators/component';

export {
    system,
    getSystemMetadata,
} from './decorators/system';
export type { SystemDecoratorConfig } from './decorators/system';

// ==================== 工具类 ====================

export { ComponentPool } from './utils/ComponentPool';
export { BitSet } from './utils/BitSet';

// ==================== 命名空间导出 ====================

// 将所有导出打包成一个对象
import { Entity } from './core/Entity';
import { Component } from './core/Component';
import { System } from './core/System';
import { World } from './core/World';
import { Query } from './core/Query';
import { ComponentManager } from './core/ComponentManager';
import { EntityManager } from './core/EntityManager';
import { SystemManager } from './core/SystemManager';
import { component, getComponentMetadata } from './decorators/component';
import { system, getSystemMetadata } from './decorators/system';
import { ComponentPool } from './utils/ComponentPool';
import { BitSet } from './utils/BitSet';

/**
 * ECS 命名空间对象
 * 包含所有 ECS 相关的类、接口和工具
 */
export const ECS = {
    // 核心类
    Entity,
    Component,
    System,
    World,
    Query,
    ComponentManager,
    EntityManager,
    SystemManager,
    
    // 装饰器
    component,
    getComponentMetadata,
    system,
    getSystemMetadata,
    
    // 工具类
    ComponentPool,
    BitSet,
} as const;

// 默认导出 ECS 对象
export default ECS;
