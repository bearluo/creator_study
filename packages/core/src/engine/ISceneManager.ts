/**
 * 场景管理器接口（可选）
 */

import { INode } from './IUIManager';

/**
 * 场景管理器接口
 */
export interface ISceneManager {
    /** 加载场景 */
    loadScene(name: string): Promise<void>;
    /** 预加载场景 */
    preloadScene(name: string): Promise<void>;
    /** 获取当前场景 */
    getCurrentScene(): IScene | null;
}

/**
 * 场景接口
 */
export interface IScene {
    /** 场景名称 */
    name: string;
    /** 场景根节点 */
    root: INode;
}

