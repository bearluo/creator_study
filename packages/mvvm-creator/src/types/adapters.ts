/**
 * 适配器接口定义
 */

import type { IView } from '@bl-framework/mvvm';
import type { CocosNode, CocosComponent } from './index';

/**
 * Cocos Creator Node 到 View 的映射配置
 */
export interface NodeViewMapping {
    /** 节点路径（相对于根节点） */
    path: string;
    /** View 路径（用于数据绑定） */
    viewPath: string;
    /** 组件类型名称 */
    componentType?: string;
    /** 属性名称 */
    propertyName?: string;
}

/**
 * 组件属性访问器
 * 
 * 提供类型安全的组件属性访问方式
 */
export interface ComponentPropertyAccessor {
    /** 
     * 获取组件
     * @param node 节点
     * @param componentType 组件类型（构造函数或类型名称字符串）
     * @returns 组件实例或 null
     */
    getComponent(node: CocosNode, componentType: any): CocosComponent | null;
    /** 
     * 设置属性值
     * @param component 组件实例
     * @param propertyName 属性名称
     * @param value 属性值
     */
    setProperty(component: CocosComponent, propertyName: string, value: any): void;
    /** 
     * 获取属性值
     * @param component 组件实例
     * @param propertyName 属性名称
     * @returns 属性值
     */
    getProperty(component: CocosComponent, propertyName: string): any;
}

/**
 * Cocos Creator 视图适配器配置
 */
export interface CocosViewAdapterConfig {
    /** 根节点 */
    rootNode: CocosNode;
    /** 节点到视图的映射配置 */
    mappings?: NodeViewMapping[];
    /** 组件属性访问器（可选，用于自定义属性访问） */
    propertyAccessor?: ComponentPropertyAccessor;
}

