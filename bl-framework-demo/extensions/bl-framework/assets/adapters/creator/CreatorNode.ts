/**
 * Creator 节点适配器
 */

import { Node, Component, Constructor } from 'cc';
import { INode } from '@bl-framework/core';

/**
 * Creator 节点适配器
 */
export class CreatorNode implements INode {
    private node: Node;
    
    constructor(node: Node) {
        this.node = node;
    }
    
    get name(): string {
        return this.node.name;
    }
    
    set name(value: string) {
        this.node.name = value;
    }
    
    get parent(): INode | null {
        return this.node.parent ? new CreatorNode(this.node.parent) : null;
    }
    
    get children(): INode[] {
        return this.node.children.map(child => new CreatorNode(child));
    }
    
    addChild(child: INode): void {
        if (child instanceof CreatorNode) {
            this.node.addChild(child.node);
        }
    }
    
    removeChild(child: INode): void {
        if (child instanceof CreatorNode) {
            this.node.removeChild(child.node);
        }
    }
    
    addComponent<T>(type: string): T {
        const ComponentClass = this.getComponentClass(type);
        return this.node.addComponent(ComponentClass) as T;
    }
    
    getComponent<T>(type: string): T | null {
        const ComponentClass = this.getComponentClass(type);
        return this.node.getComponent(ComponentClass) as T;
    }
    
    destroy(): void {
        this.node.destroy();
    }
    
    /**
     * 获取 Creator 原生节点（用于需要直接访问 Creator API 的场景）
     */
    get nativeNode(): Node {
        return this.node;
    }
    
    private getComponentClass(type: string): Constructor<Component> {
        // 组件类型注册表
        // 这里可以根据需要扩展
        const componentMap: Record<string, Constructor<Component>> = {
            // 可以在这里注册常用的组件类型
        };
        return componentMap[type] || Component;
    }
}

