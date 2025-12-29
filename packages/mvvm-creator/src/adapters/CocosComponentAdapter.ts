/**
 * Cocos Creator 组件适配器
 * 
 * 将 Cocos Creator Component 适配为 MVVM View 接口
 * 提供更直接的组件属性绑定和事件绑定
 */

import type { IView } from '@bl-framework/mvvm';
import type { Component } from 'cc';
import type { CocosComponent } from '../types';

/**
 * 组件属性绑定配置
 */
export interface ComponentPropertyBinding {
    /** 属性名称 */
    propertyName: string;
    /** 视图路径（用于数据绑定） */
    viewPath: string;
    /** 转换函数（可选） */
    converter?: (value: any) => any;
    /** 反向转换函数（可选，用于双向绑定） */
    reverseConverter?: (value: any) => any;
}

/**
 * 组件事件绑定配置
 */
export interface ComponentEventBinding {
    /** 事件名称 */
    eventName: string;
    /** 视图路径（用于数据绑定，通常是方法路径） */
    viewPath: string;
}

/**
 * Cocos Creator 组件适配器配置
 */
export interface CocosComponentAdapterConfig {
    /** 组件实例 */
    component: CocosComponent;
    /** 属性绑定配置 */
    propertyBindings?: ComponentPropertyBinding[];
    /** 事件绑定配置 */
    eventBindings?: ComponentEventBinding[];
}

/**
 * Cocos Creator 组件适配器
 * 
 * 将 Cocos Creator Component 适配为 MVVM View 接口
 * 提供组件级别的属性绑定和事件绑定
 * 
 * @example
 * ```typescript
 * @ccclass('MyComponent')
 * export class MyComponent extends Component {
 *     @property(Label)
 *     label: Label | null = null;
 *     
 *     private adapter: CocosComponentAdapter | null = null;
 *     
 *     onLoad() {
 *         this.adapter = new CocosComponentAdapter({
 *             component: this,
 *             propertyBindings: [
 *                 { propertyName: 'label.string', viewPath: 'title' }
 *             ]
 *         });
 *     }
 * }
 * ```
 */
export class CocosComponentAdapter implements IView {
    private component: CocosComponent;
    private propertyBindings: Map<string, ComponentPropertyBinding> = new Map();
    private eventBindings: Map<string, ComponentEventBinding> = new Map();
    private eventUnsubscribes: Map<string, () => void> = new Map();
    
    constructor(config: CocosComponentAdapterConfig) {
        this.component = config.component;
        
        // 建立属性绑定映射
        if (config.propertyBindings) {
            config.propertyBindings.forEach(binding => {
                this.propertyBindings.set(binding.viewPath, binding);
            });
        }
        
        // 建立事件绑定映射
        if (config.eventBindings) {
            config.eventBindings.forEach(binding => {
                this.eventBindings.set(binding.viewPath, binding);
            });
        }
    }
    
    /**
     * 更新视图路径的值
     * @param path 视图路径
     * @param value 新值
     */
    update(path: string, value: any): void {
        const binding = this.propertyBindings.get(path);
        if (binding) {
            this._updateProperty(binding, value);
        } else {
            // 默认行为：尝试直接更新组件属性
            this._updateComponentProperty(path, value);
        }
    }
    
    /**
     * 获取视图路径的值
     * @param path 视图路径
     * @returns 当前值
     */
    get(path: string): any {
        const binding = this.propertyBindings.get(path);
        if (binding) {
            return this._getProperty(binding);
        } else {
            // 默认行为：尝试直接获取组件属性
            return this._getComponentProperty(path);
        }
    }
    
    /**
     * 设置视图路径的值
     * @param path 视图路径
     * @param value 新值
     */
    set(path: string, value: any): void {
        this.update(path, value);
        // 触发 change 事件（用于双向绑定）
        this._emitChange(path, value);
    }
    
    /**
     * 监听视图事件
     * @param event 事件名称
     * @param callback 回调函数
     * @returns 取消监听的函数
     */
    on(event: string, callback: (...args: any[]) => void): () => void {
        if (event === 'change') {
            // change 事件是内部事件，不需要绑定到 Cocos Creator 组件
            return () => {}; // 暂时返回空函数
        }
        
        // 其他事件绑定到组件节点
        const node = this.component.node;
        node.on(event, callback, this.component);
        
        const unsubscribe = () => {
            node.off(event, callback, this.component);
            this.eventUnsubscribes.delete(event);
        };
        
        this.eventUnsubscribes.set(event, unsubscribe);
        return unsubscribe;
    }
    
    /**
     * 销毁视图适配器
     */
    destroy(): void {
        // 取消所有事件监听
        this.eventUnsubscribes.forEach(unsubscribe => unsubscribe());
        this.eventUnsubscribes.clear();
        
        // 清空绑定
        this.propertyBindings.clear();
        this.eventBindings.clear();
    }
    
    /**
     * 更新属性
     */
    private _updateProperty(binding: ComponentPropertyBinding, value: any): void {
        const convertedValue = binding.converter ? binding.converter(value) : value;
        this._setNestedProperty(this.component, binding.propertyName, convertedValue);
    }
    
    /**
     * 获取属性
     */
    private _getProperty(binding: ComponentPropertyBinding): any {
        const value = this._getNestedProperty(this.component, binding.propertyName);
        // 注意：这里不应用 converter，因为 converter 是单向的（数据 -> 视图）
        return value;
    }
    
    /**
     * 更新组件属性（默认行为）
     */
    private _updateComponentProperty(path: string, value: any): void {
        this._setNestedProperty(this.component, path, value);
    }
    
    /**
     * 获取组件属性（默认行为）
     */
    private _getComponentProperty(path: string): any {
        return this._getNestedProperty(this.component, path);
    }
    
    /**
     * 设置嵌套属性（支持 'label.string' 这样的路径）
     */
    private _setNestedProperty(obj: any, path: string, value: any): void {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        let target = obj;
        
        for (const key of keys) {
            if (target[key] === null || target[key] === undefined) {
                console.warn(`[CocosComponentAdapter] Property path not found: ${path}`);
                return;
            }
            target = target[key];
        }
        
        target[lastKey] = value;
    }
    
    /**
     * 获取嵌套属性（支持 'label.string' 这样的路径）
     */
    private _getNestedProperty(obj: any, path: string): any {
        const keys = path.split('.');
        let value = obj;
        
        for (const key of keys) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[key];
        }
        
        return value;
    }
    
    /**
     * 触发 change 事件（用于双向绑定）
     */
    private _emitChange(path: string, value: any): void {
        // 这里可以实现一个简单的事件系统
        // 暂时不实现，因为双向绑定通常通过 Cocos Creator 的事件系统来处理
    }
    
    /**
     * 添加属性绑定
     * @param binding 属性绑定配置
     */
    addPropertyBinding(binding: ComponentPropertyBinding): void {
        this.propertyBindings.set(binding.viewPath, binding);
    }
    
    /**
     * 移除属性绑定
     * @param viewPath 视图路径
     */
    removePropertyBinding(viewPath: string): void {
        this.propertyBindings.delete(viewPath);
    }
    
    /**
     * 添加事件绑定
     * @param binding 事件绑定配置
     */
    addEventBinding(binding: ComponentEventBinding): void {
        this.eventBindings.set(binding.viewPath, binding);
    }
    
    /**
     * 移除事件绑定
     * @param viewPath 视图路径
     */
    removeEventBinding(viewPath: string): void {
        this.eventBindings.delete(viewPath);
    }
    
    /**
     * 获取所有属性绑定
     * @returns 所有属性绑定配置
     */
    getPropertyBindings(): ReadonlyMap<string, ComponentPropertyBinding> {
        return this.propertyBindings;
    }
    
    /**
     * 获取所有事件绑定
     * @returns 所有事件绑定配置
     */
    getEventBindings(): ReadonlyMap<string, ComponentEventBinding> {
        return this.eventBindings;
    }
}

