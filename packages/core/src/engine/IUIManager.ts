/**
 * UI 管理器接口
 */

/**
 * UI 管理器接口
 */
export interface IUIManager {
    /** 创建节点 */
    createNode(name?: string): INode;
    /** 创建组件 */
    createComponent<T>(type: string): T;
    /** 实例化预制体 */
    instantiate(prefab: IPrefab): INode;
    /** 查找节点 */
    findNode(path: string): INode | null;
    /** 获取根节点 */
    getRoot(): INode;
}

/**
 * 节点接口
 */
export interface INode {
    /** 节点名称 */
    name: string;
    /** 父节点 */
    parent: INode | null;
    /** 子节点列表 */
    children: INode[];
    /** 添加子节点 */
    addChild(child: INode): void;
    /** 移除子节点 */
    removeChild(child: INode): void;
    /** 添加组件 */
    addComponent<T>(type: string): T;
    /** 获取组件 */
    getComponent<T>(type: string): T | null;
    /** 销毁节点 */
    destroy(): void;
}

/**
 * 预制体接口
 */
export interface IPrefab {
    /** 预制体路径 */
    path: string;
    /** 预制体数据 */
    data: any;
}

