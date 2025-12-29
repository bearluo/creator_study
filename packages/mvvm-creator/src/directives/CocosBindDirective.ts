/**
 * Cocos Creator 属性绑定指令
 * 
 * 绑定属性到 Cocos Creator Node 或 Component
 */

import { Reactive, Watcher } from '@bl-framework/mvvm';
import type { Node, Component } from 'cc';
import type { CocosNode, CocosComponent } from '../types';

/**
 * Cocos Creator 属性绑定指令上下文
 */
export interface CocosBindDirectiveContext {
    node?: CocosNode;
    component?: CocosComponent;
    componentType?: string; // 组件类型名称（如 'Label', 'Button'）
    propertyName: string;
    path: string;
    mode?: 'one-way' | 'two-way';
    converter?: (value: any) => any;
    reverseConverter?: (value: any) => any;
}

/**
 * Cocos Creator 属性绑定指令
 * 
 * 绑定属性到 Cocos Creator Node 或 Component
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({ title: 'Hello', count: 10 });
 * const node = this.node;
 * 
 * // 绑定到 Label 组件的 string 属性
 * const directive = new CocosBindDirective(reactive, 'title', 'string', {
 *     componentType: 'Label'
 * });
 * directive.execute({
 *     node,
 *     componentType: 'Label',
 *     propertyName: 'string',
 *     path: 'title'
 * });
 * ```
 */
export class CocosBindDirective {
    private reactive: Reactive<any>;
    private path: string;
    private propertyName: string;
    private componentType?: string;
    private mode: 'one-way' | 'two-way' = 'one-way';
    private converter?: (value: any) => any;
    private reverseConverter?: (value: any) => any;
    private watcher: any = null;
    private unsubscribe?: () => void;
    
    constructor(
        reactive: Reactive<any>,
        path: string,
        propertyName: string,
        options?: {
            componentType?: string;
            mode?: 'one-way' | 'two-way';
            converter?: (value: any) => any;
            reverseConverter?: (value: any) => any;
        }
    ) {
        this.reactive = reactive;
        this.path = path;
        this.propertyName = propertyName;
        this.componentType = options?.componentType;
        this.mode = options?.mode || 'one-way';
        this.converter = options?.converter;
        this.reverseConverter = options?.reverseConverter;
    }
    
    /**
     * 执行指令
     * @param context 执行上下文
     */
    execute(context: CocosBindDirectiveContext): void {
        const value = this._getValue(this.reactive.value, this.path);
        const convertedValue = this.converter ? this.converter(value) : value;
        
        this._setProperty(context, convertedValue);
        
        // 双向绑定：监听组件/节点变化（需要具体的实现）
        // 注意：Cocos Creator 的组件属性变化通常通过事件系统来监听
        // 这里简化处理，双向绑定需要额外的配置
        
        // 创建观察者，监听数据变化
        this.watcher = new Watcher(
            (key, newValue, oldValue) => {
                // 当路径对应的属性变化时更新
                if (String(key) === this.path || this.path.startsWith(String(key) + '.')) {
                    const value = this._getValue(this.reactive.value, this.path);
                    const convertedValue = this.converter ? this.converter(value) : value;
                    this._setProperty(context, convertedValue);
                }
            },
            () => {
                // 运行回调：重新绑定
                const value = this._getValue(this.reactive.value, this.path);
                const convertedValue = this.converter ? this.converter(value) : value;
                this._setProperty(context, convertedValue);
            }
        );
        
        this.unsubscribe = this.reactive.watch(this.watcher);
    }
    
    /**
     * 更新指令
     * @param context 执行上下文
     */
    update(context: CocosBindDirectiveContext): void {
        const value = this._getValue(this.reactive.value, this.path);
        const convertedValue = this.converter ? this.converter(value) : value;
        this._setProperty(context, convertedValue);
    }
    
    /**
     * 设置属性
     */
    private _setProperty(context: CocosBindDirectiveContext, value: any): void {
        if (context.component) {
            // 直接设置组件属性
            (context.component as any)[context.propertyName] = value;
        } else if (context.node) {
            // 设置节点属性或组件属性
            if (context.componentType) {
                // 通过组件类型设置属性
                const ComponentClass = (globalThis as any).cc?.[context.componentType] as typeof Component | undefined;
                if (ComponentClass) {
                    const component = context.node.getComponent(ComponentClass);
                    if (component) {
                        (component as any)[context.propertyName] = value;
                    }
                }
            } else {
                // 直接设置节点属性
                (context.node as any)[context.propertyName] = value;
            }
        }
    }
    
    /**
     * 获取嵌套路径的值
     */
    private _getValue(obj: any, path: string): any {
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
     * 销毁指令
     */
    destroy(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
        this.watcher = null;
    }
}

