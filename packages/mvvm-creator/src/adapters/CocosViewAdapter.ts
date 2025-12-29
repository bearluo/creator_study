/**
 * Cocos Creator 视图适配器
 * 
 * 将 Cocos Creator Node 适配为 MVVM View 接口
 */

import type { IView } from '@bl-framework/mvvm';
import type { CocosNode, CocosComponent } from '../types';
import type { NodeViewMapping, ComponentPropertyAccessor, CocosViewAdapterConfig } from '../types/adapters';

/**
 * Cocos Creator 视图适配器
 * 
 * 实现 MVVM View 接口，适配 Cocos Creator Node
 * 
 * @example
 * ```typescript
 * const node = this.node; // Cocos Creator Node
 * const adapter = new CocosViewAdapter({ rootNode: node });
 * 
 * // 绑定数据
 * viewModel.bind('title', adapter, { mode: 'one-way' });
 * ```
 */
export class CocosViewAdapter implements IView {
    private rootNode: CocosNode;
    private mappings: Map<string, NodeViewMapping> = new Map();
    private propertyAccessor?: ComponentPropertyAccessor;
    private eventUnsubscribes: Map<string, () => void> = new Map();
    
    constructor(config: CocosViewAdapterConfig) {
        this.rootNode = config.rootNode;
        this.propertyAccessor = config.propertyAccessor;
        
        // 建立映射关系
        if (config.mappings) {
            config.mappings.forEach(mapping => {
                this.mappings.set(mapping.viewPath, mapping);
            });
        }
    }
    
    /**
     * 更新视图路径的值
     * @param path 视图路径（如 'title', 'player.name'）
     * @param value 新值
     */
    update(path: string, value: any): void {
        const mapping = this.mappings.get(path);
        if (mapping) {
            this._updateNodeByMapping(mapping, value);
        } else {
            // 默认行为：尝试更新根节点的属性
            this._updateNodeProperty(this.rootNode, path, value);
        }
    }
    
    /**
     * 获取视图路径的值
     * @param path 视图路径
     * @returns 当前值
     */
    get(path: string): any {
        const mapping = this.mappings.get(path);
        if (mapping) {
            return this._getNodeValueByMapping(mapping);
        } else {
            return this._getNodeProperty(this.rootNode, path);
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
            // change 事件是内部事件，不需要绑定到 Cocos Creator 节点
            // 可以在这里实现一个简单的内部事件系统
            return () => {}; // 暂时返回空函数
        }
        
        // 其他事件绑定到根节点
        this.rootNode.on(event, callback);
        
        const unsubscribe = () => {
            this.rootNode.off(event, callback);
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
        
        // 清空映射
        this.mappings.clear();
    }
    
    /**
     * 根据映射更新节点
     */
    private _updateNodeByMapping(mapping: NodeViewMapping, value: any): void {
        const node = this._getNodeByPath(mapping.path);
        if (!node) {
            console.warn(`[CocosViewAdapter] Node not found: ${mapping.path}`);
            return;
        }
        
        if (mapping.componentType && mapping.propertyName) {
            // 更新组件属性
            this._updateComponentProperty(node, mapping.componentType, mapping.propertyName, value);
        } else {
            // 更新节点属性
            this._updateNodeProperty(node, mapping.propertyName || '', value);
        }
    }
    
    /**
     * 根据映射获取节点值
     */
    private _getNodeValueByMapping(mapping: NodeViewMapping): any {
        const node = this._getNodeByPath(mapping.path);
        if (!node) {
            return undefined;
        }
        
        if (mapping.componentType && mapping.propertyName) {
            return this._getComponentProperty(node, mapping.componentType, mapping.propertyName);
        } else {
            return this._getNodeProperty(node, mapping.propertyName || '');
        }
    }
    
    /**
     * 根据路径获取节点
     */
    private _getNodeByPath(path: string): CocosNode | null {
        if (path === '' || path === '/') {
            return this.rootNode;
        }
        
        // 简单的路径解析（支持 '/' 分隔的路径）
        const parts = path.split('/').filter(p => p);
        let currentNode: CocosNode | null = this.rootNode;
        
        for (const part of parts) {
            if (!currentNode) {
                return null;
            }
            
            const child: CocosNode | undefined = currentNode.children.find((c) => c.name === part);
            if (!child) {
                return null;
            }
            
            currentNode = child;
        }
        
        return currentNode;
    }
    
    /**
     * 更新组件属性
     * 
     * 注意：componentType 应该是从 'cc' 模块导入的组件类
     * 例如：Label, Button, Sprite 等
     * 由于类型系统的限制，这里使用 any 类型来处理动态组件类型
     */
    private _updateComponentProperty(
        node: CocosNode,
        componentType: string,
        propertyName: string,
        value: any
    ): void {
        // 注意：在实际使用中，componentType 应该是一个组件类的构造函数
        // 但由于字符串类型的限制，我们需要使用动态方式
        // 建议使用 ComponentPropertyAccessor 来提供更好的类型安全
        
        // 使用属性访问器（如果提供）- 推荐方式
        if (this.propertyAccessor) {
            // 通过属性访问器获取组件
            const component = this.propertyAccessor.getComponent(node, componentType as any);
            if (component) {
                this.propertyAccessor.setProperty(component, propertyName, value);
            } else {
                console.warn(`[CocosViewAdapter] Component not found: ${componentType}`);
            }
        } else {
            // 默认行为：尝试通过节点路径直接访问
            // 注意：这种方式需要组件已经被添加到节点上，并且属性名称正确
            console.warn(`[CocosViewAdapter] PropertyAccessor not provided, cannot update component property`);
        }
    }
    
    /**
     * 获取组件属性
     * 
     * 注意：componentType 应该是从 'cc' 模块导入的组件类
     */
    private _getComponentProperty(
        node: CocosNode,
        componentType: string,
        propertyName: string
    ): any {
        // 使用属性访问器（如果提供）- 推荐方式
        if (this.propertyAccessor) {
            const component = this.propertyAccessor.getComponent(node, componentType as any);
            if (component) {
                return this.propertyAccessor.getProperty(component, propertyName);
            }
        } else {
            console.warn(`[CocosViewAdapter] PropertyAccessor not provided, cannot get component property`);
        }
        
        return undefined;
    }
    
    /**
     * 更新节点属性
     */
    private _updateNodeProperty(node: CocosNode, propertyName: string, value: any): void {
        if (!propertyName) {
            return;
        }
        
        // 常见的节点属性
        switch (propertyName) {
            case 'active':
                node.active = Boolean(value);
                break;
            case 'name':
                node.name = String(value);
                break;
            default:
                // 尝试设置自定义属性
                (node as any)[propertyName] = value;
                break;
        }
    }
    
    /**
     * 获取节点属性
     */
    private _getNodeProperty(node: CocosNode, propertyName: string): any {
        if (!propertyName) {
            return undefined;
        }
        
        // 常见的节点属性
        switch (propertyName) {
            case 'active':
                return node.active;
            case 'name':
                return node.name;
            default:
                // 尝试获取自定义属性
                return (node as any)[propertyName];
        }
    }
    
    /**
     * 触发 change 事件（用于双向绑定）
     */
    private _emitChange(path: string, value: any): void {
        // 这里可以实现一个简单的事件系统
        // 暂时不实现，因为双向绑定通常通过 Cocos Creator 的事件系统来处理
    }
    
    /**
     * 添加映射
     * @param mapping 映射配置
     */
    addMapping(mapping: NodeViewMapping): void {
        this.mappings.set(mapping.viewPath, mapping);
    }
    
    /**
     * 移除映射
     * @param viewPath 视图路径
     */
    removeMapping(viewPath: string): void {
        this.mappings.delete(viewPath);
    }
    
    /**
     * 获取所有映射
     * @returns 所有映射配置
     */
    getMappings(): ReadonlyMap<string, NodeViewMapping> {
        return this.mappings;
    }
}

