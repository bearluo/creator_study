/**
 * Cocos Creator 列表渲染指令
 * 
 * 根据数组数据渲染 Cocos Creator Node 列表
 */

import { Reactive, Watcher } from '@bl-framework/mvvm';
import { instantiate, Prefab } from 'cc';
import type { CocosNode, CocosPrefab } from '../types';

/**
 * Cocos Creator 列表渲染指令上下文
 */
export interface CocosForDirectiveContext {
    containerNode: CocosNode; // 容器节点
    itemTemplate?: CocosNode | CocosPrefab | (() => CocosNode); // 项模板（节点或创建函数）
    path: string;
    itemKey?: string | ((item: any, index: number) => string | number);
    /** 数据绑定函数：将数据绑定到节点 */
    onItemDataBind?: (node: CocosNode, data: any, index: number) => void;
}

/**
 * 列表项上下文
 */
interface ForDirectiveItemContext {
    node: CocosNode; // 节点实例
    itemData: any; // 数据快照（用于对比）
    key: string | number; // 唯一键
}

/**
 * Cocos Creator 列表渲染指令
 * 
 * 根据数组数据渲染 Cocos Creator Node 列表
 * 
 * @example
 * ```typescript
 * const reactive = new Reactive({
 *     items: [
 *         { id: 1, name: 'Item 1' },
 *         { id: 2, name: 'Item 2' }
 *     ]
 * });
 * 
 * const containerNode = this.node; // 容器节点
 * const template = this.itemTemplate; // 项模板节点
 * 
 * const directive = new CocosForDirective(reactive, 'items');
 * directive.execute({
 *     containerNode,
 *     itemTemplate: template,
 *     path: 'items',
 *     itemKey: (item) => item.id
 * });
 * ```
 */
export class CocosForDirective {
    private reactive: Reactive<any>;
    private path: string;
    private itemContexts: Map<string | number, ForDirectiveItemContext> = new Map(); // key -> context
    private watcher: any = null;
    private unsubscribe?: () => void;
    private context?: CocosForDirectiveContext; // 保存上下文以便在更新时使用
    
    constructor(reactive: Reactive<any>, path: string) {
        this.reactive = reactive;
        this.path = path;
    }
    
    /**
     * 执行指令
     * @param context 执行上下文
     */
    execute(context: CocosForDirectiveContext): void {
        this.context = context; // 保存上下文
        const items = this._getValue(this.reactive.value, this.path);
        
        if (!Array.isArray(items)) {
            console.warn(`[CocosForDirective] Path "${this.path}" is not an array`);
            return;
        }
        
        // 创建观察者，监听数组变化
        // 注意：watch 注册时会立即触发一次 run 回调，所以不需要手动初始渲染
        this.watcher = new Watcher(
            (key, newValue, oldValue) => {
                // update 回调：只记录变化，不立即渲染
                // 批量更新机制会在所有 update 回调执行完后统一调用 run 回调
            },
            () => {
                // run 回调：批量更新后统一重新渲染
                // 这个回调在 watch 注册时会立即执行一次，用于初始渲染
                const items = this._getValue(this.reactive.value, this.path);
                if (Array.isArray(items)) {
                    this._renderItems(items, context);
                }
            }
        );
        
        // watch 注册时会立即触发 run 回调，完成初始渲染
        this.unsubscribe = this.reactive.watch(this.watcher);
    }
    
    /**
     * 更新指令
     * @param context 执行上下文
     */
    update(context: CocosForDirectiveContext): void {
        const items = this._getValue(this.reactive.value, this.path);
        if (Array.isArray(items)) {
            this._renderItems(items, context);
        }
    }
    
    /**
     * 渲染列表项
     */
    private _renderItems(items: any[], context: CocosForDirectiveContext): void {
        const newKeys = new Set<string | number>();
        
        // 创建或更新项，并保证节点顺序与数组顺序一致
        items.forEach((item, index) => {
            const key = this._getItemKey(item, index, context);
            newKeys.add(key);
            
            let itemContext = this.itemContexts.get(key);
            
            if (!itemContext) {
                // 创建新节点上下文
                const newItemContext = this._createItemContext(context, item, index, key);
                if (newItemContext) {
                    itemContext = newItemContext;
                    this.itemContexts.set(key, itemContext);
                    // 在指定位置插入节点，保证顺序
                    this._insertNodeAt(context.containerNode, itemContext.node, index);
                }
            } else {
                // 更新现有节点
                this._updateItemContext(itemContext, item, context, index);
                // 确保节点位置正确
                this._ensureNodeOrder(context.containerNode, itemContext.node, index);
            }
        });
        
        // 移除不存在的项
        this._removeObsoleteItems(newKeys);
    }
    
    /**
     * 在指定位置插入节点
     */
    private _insertNodeAt(containerNode: CocosNode, node: CocosNode, index: number): void {
        // 使用 insertChild 在指定位置插入
        containerNode.insertChild(node, index);
    }
    
    /**
     * 确保节点在正确的位置
     */
    private _ensureNodeOrder(containerNode: CocosNode, node: CocosNode, expectedIndex: number): void {
        const currentIndex = this._getNodeSiblingIndex(node);
        if (currentIndex !== expectedIndex) {
            this._setNodeSiblingIndex(node, expectedIndex);
        }
    }
    
    /**
     * 获取节点在父节点中的索引
     */
    private _getNodeSiblingIndex(node: CocosNode): number {
        return node.getSiblingIndex();
    }
    
    /**
     * 设置节点在父节点中的索引
     */
    private _setNodeSiblingIndex(node: CocosNode, index: number): void {
        node.setSiblingIndex(index);
    }
    
    /**
     * 创建项上下文
     */
    private _createItemContext(
        context: CocosForDirectiveContext,
        item: any,
        index: number,
        key: string | number
    ): ForDirectiveItemContext | null {
        // 创建节点
        const node = this._createItemNode(context, item, index, key);
        if (!node) {
            return null;
        }
        
        // 直接使用引用，不进行深度拷贝
        const itemData = item;
        
        // 绑定数据到节点
        this._bindItemDataToNode(node, itemData, context, index);
        
        // 创建项上下文
        const itemContext: ForDirectiveItemContext = {
            node,
            itemData,
            key
        };
        
        return itemContext;
    }
    
    /**
     * 创建项节点
     */
    private _createItemNode(
        context: CocosForDirectiveContext,
        item: any,
        index: number,
        key: string | number
    ): CocosNode | null {
        if (!context.itemTemplate) {
            console.warn('[CocosForDirective] Item template not provided');
            return null;
        }
        
        let templateNode: CocosNode;
        
        if (typeof context.itemTemplate === 'function') {
            // 模板是创建函数
            templateNode = context.itemTemplate();
        } else if (context.itemTemplate instanceof Prefab) {
            // 模板是预制体，需要实例化
            templateNode = instantiate(context.itemTemplate);
        } else {
            // 模板是节点，需要克隆
            templateNode = instantiate(context.itemTemplate);
        }
        
        return templateNode;
    }
    
    /**
     * 绑定数据到节点（简化版：只支持 onItemDataBind 回调）
     */
    private _bindItemDataToNode(
        node: CocosNode,
        data: any,
        context: CocosForDirectiveContext,
        index: number
    ): void {
        if (context.onItemDataBind) {
            context.onItemDataBind(node, data, index);
        }
    }
    
    /**
     * 更新项上下文
     */
    private _updateItemContext(
        itemContext: ForDirectiveItemContext,
        newItemData: any,
        context: CocosForDirectiveContext,
        index: number
    ): void {
        // 检查数据是否变化（使用引用对比）
        if (itemContext.itemData !== newItemData) {
            // 更新节点数据
            this._bindItemDataToNode(itemContext.node, newItemData, context, index);
            itemContext.itemData = newItemData;
        }
    }
    
    
    /**
     * 移除不存在的项
     */
    private _removeObsoleteItems(newKeys: Set<string | number>): void {
        const keysToRemove: (string | number)[] = [];
        
        this.itemContexts.forEach((itemContext, key) => {
            if (!newKeys.has(key)) {
                // 销毁节点
                itemContext.node.destroy();
                keysToRemove.push(key);
            }
        });
        
        keysToRemove.forEach(key => {
            this.itemContexts.delete(key);
        });
    }
    
    
    /**
     * 获取项的唯一键
     */
    private _getItemKey(item: any, index: number, context: CocosForDirectiveContext): string | number {
        if (context.itemKey) {
            if (typeof context.itemKey === 'function') {
                return context.itemKey(item, index);
            } else if (typeof context.itemKey === 'string') {
                return item[context.itemKey] ?? index;
            }
        }
        
        // 默认使用索引
        return index;
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
        // 清理所有项上下文
        this.itemContexts.forEach(itemContext => {
            itemContext.node.destroy();
        });
        
        this.itemContexts.clear();
        
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
        this.watcher = null;
        this.context = undefined;
    }
}

