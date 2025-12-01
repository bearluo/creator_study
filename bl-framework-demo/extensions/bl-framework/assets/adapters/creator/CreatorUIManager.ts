/**
 * Creator UI 管理器适配器
 */

import { Node, Component, Prefab, instantiate, director, Constructor } from 'cc';
import { IUIManager, INode, IPrefab } from '@bl-framework/core';
import { CreatorNode } from './CreatorNode';

/**
 * Creator UI 管理器适配器
 */
export class CreatorUIManager implements IUIManager {
    private rootNode: Node | null = null;
    
    /**
     * 创建节点
     */
    createNode(name?: string): INode {
        const node = new Node(name || 'Node');
        return new CreatorNode(node);
    }
    
    /**
     * 创建组件
     */
    createComponent<T>(type: string): T {
        const ComponentClass = this.getComponentClass(type);
        return new ComponentClass() as T;
    }
    
    /**
     * 实例化预制体
     */
    instantiate(prefab: IPrefab): INode {
        const node = instantiate(prefab.data as Prefab);
        return new CreatorNode(node);
    }
    
    /**
     * 查找节点
     */
    findNode(path: string): INode | null {
        const root = this.getRoot();
        if (root instanceof CreatorNode) {
            const node = root.nativeNode.getChildByPath(path);
            return node ? new CreatorNode(node) : null;
        }
        return null;
    }
    
    /**
     * 获取根节点
     */
    getRoot(): INode {
        if (!this.rootNode) {
            const scene = director.getScene();
            if (scene) {
                this.rootNode = scene.getChildByName('Canvas') || scene;
            } else {
                this.rootNode = new Node('Canvas');
            }
        }
        return new CreatorNode(this.rootNode);
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

