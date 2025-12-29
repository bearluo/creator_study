/**
 * Cocos Creator 事件绑定指令
 * 
 * 绑定事件处理器到 Cocos Creator Node
 */

import { Reactive, Watcher } from '@bl-framework/mvvm';
import type { Node, Component } from 'cc';
import type { CocosNode, CocosComponent } from '../types';

/**
 * Cocos Creator 事件绑定指令上下文
 */
export interface CocosOnDirectiveContext {
    node: CocosNode;
    component?: CocosComponent; // 可选，如果提供则绑定到组件
    eventName: string;
    handler?: (...args: any[]) => void;
    handlerPath?: string; // 响应式数据中的方法路径
}

/**
 * Cocos Creator 事件绑定指令
 * 
 * 绑定事件处理器到 Cocos Creator Node 或 Component
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({
 *     onClick: () => console.log('clicked'),
 *     onHover: () => console.log('hovered')
 * });
 * 
 * const node = this.node;
 * const directive = new CocosOnDirective(reactive, 'click', 'onClick');
 * directive.execute({ node, eventName: 'click', handlerPath: 'onClick' });
 * ```
 */
export class CocosOnDirective {
    private reactive: Reactive<any>;
    private eventName: string;
    private handlerPath?: string;
    private currentHandler?: (...args: any[]) => void;
    private target?: CocosNode;
    private targetComponent?: CocosComponent;
    private unsubscribe?: () => void;
    
    constructor(
        reactive: Reactive<any>,
        eventName: string,
        handlerPath?: string
    ) {
        this.reactive = reactive;
        this.eventName = eventName;
        this.handlerPath = handlerPath;
    }
    
    /**
     * 执行指令
     * @param context 执行上下文
     */
    execute(context: CocosOnDirectiveContext): void {
        this.target = context.node;
        this.targetComponent = context.component;
        this._bindEvent(context);
        
        // 如果 handlerPath 存在，监听变化
        if (this.handlerPath || context.handlerPath) {
            const path = this.handlerPath || context.handlerPath!;
            const watcher = new Watcher(
                (key, newValue, oldValue) => {
                    // 当处理器变化时重新绑定
                    if (String(key) === path || (path && path.startsWith(String(key) + '.'))) {
                        this._unbindEvent();
                        this._bindEvent(context);
                    }
                },
                () => {
                    // 运行回调：重新绑定
                    this._unbindEvent();
                    this._bindEvent(context);
                }
            );
            
            this.unsubscribe = this.reactive.watch(watcher);
        }
    }
    
    /**
     * 更新指令
     * @param context 执行上下文
     */
    update(context: CocosOnDirectiveContext): void {
        this._unbindEvent();
        this._bindEvent(context);
    }
    
    /**
     * 绑定事件
     */
    private _bindEvent(context: CocosOnDirectiveContext): void {
        let handler: ((...args: any[]) => void) | undefined;
        
        if (context.handler) {
            // 使用提供的处理器
            handler = context.handler;
        } else {
            // 从响应式数据中获取处理器
            const path = this.handlerPath || context.handlerPath;
            if (path) {
                handler = this._getValue(this.reactive.value, path);
            }
        }
        
        if (handler && typeof handler === 'function') {
            this.currentHandler = handler;
            const eventName = context.eventName || this.eventName;
            
            // 绑定到节点（组件作为 target）
            if (this.targetComponent) {
                this.target!.on(eventName, handler, this.targetComponent);
            } else {
                this.target!.on(eventName, handler);
            }
        } else {
            console.warn(`[CocosOnDirective] Handler not found for event "${context.eventName || this.eventName}"`);
        }
    }
    
    /**
     * 解绑事件
     */
    private _unbindEvent(): void {
        if (this.currentHandler && this.target) {
            const eventName = this.eventName;
            
            // 从节点解绑
            if (this.targetComponent) {
                this.target.off(eventName, this.currentHandler, this.targetComponent);
            } else {
                this.target.off(eventName, this.currentHandler);
            }
            
            this.currentHandler = undefined;
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
        this._unbindEvent();
        
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    }
}

