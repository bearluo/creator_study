/**
 * Cocos Creator 条件渲染指令
 * 
 * 根据条件显示或隐藏 Cocos Creator Node
 */

import { Reactive, Watcher } from '@bl-framework/mvvm';
import type { Node } from 'cc';
import type { CocosNode } from '../types';

/**
 * Cocos Creator 条件渲染指令上下文
 */
export interface CocosIfDirectiveContext {
    node: CocosNode;
    path: string;
}

/**
 * Cocos Creator 条件渲染指令
 * 
 * 根据条件显示或隐藏 Cocos Creator Node
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({ isVisible: true });
 * const node = this.node; // Cocos Creator Node
 * 
 * const directive = new CocosIfDirective(reactive, 'isVisible');
 * directive.execute({ node, path: 'isVisible' });
 * 
 * reactive.value.isVisible = false; // 节点自动隐藏
 * ```
 */
export class CocosIfDirective {
    private reactive: Reactive<any>;
    private path: string;
    private watcher: any = null;
    private unsubscribe?: () => void;
    
    constructor(reactive: Reactive<any>, path: string) {
        this.reactive = reactive;
        this.path = path;
    }
    
    /**
     * 执行指令
     * @param context 执行上下文
     */
    execute(context: CocosIfDirectiveContext): void {
        const value = this._getValue(this.reactive.value, this.path);
        this._updateVisibility(context.node, Boolean(value));
        
        // 创建观察者，监听变化
        this.watcher = new Watcher(
            (key, newValue, oldValue) => {
                // 当路径对应的属性变化时更新
                if (String(key) === this.path || this.path.startsWith(String(key) + '.')) {
                    const value = this._getValue(this.reactive.value, this.path);
                    this._updateVisibility(context.node, Boolean(value));
                }
            },
            () => {
                // 运行回调：重新计算并更新
                const value = this._getValue(this.reactive.value, this.path);
                this._updateVisibility(context.node, Boolean(value));
            }
        );
        
        this.unsubscribe = this.reactive.watch(this.watcher);
    }
    
    /**
     * 更新指令
     * @param context 执行上下文
     */
    update(context: CocosIfDirectiveContext): void {
        const value = this._getValue(this.reactive.value, this.path);
        this._updateVisibility(context.node, Boolean(value));
    }
    
    /**
     * 更新可见性
     */
    private _updateVisibility(node: CocosNode, visible: boolean): void {
        node.active = visible;
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

