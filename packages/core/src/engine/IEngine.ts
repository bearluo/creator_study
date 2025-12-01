/**
 * 核心引擎接口
 */

import { EngineConfig } from './types';
import { IResourceManager } from './IResourceManager';
import { IUIManager } from './IUIManager';
import { ISceneManager } from './ISceneManager';
import { IAudioManager } from './IAudioManager';
import { INetworkManager } from './INetworkManager';
import { IHotupdateManager } from './IHotupdateManager';

/**
 * 引擎核心接口
 * 提供对各个子系统的访问
 */
export interface IEngine {
    /** 资源管理器 */
    resource: IResourceManager;
    /** UI 管理器 */
    ui: IUIManager;
    /** 场景管理器（可选） */
    scene?: ISceneManager;
    /** 音频管理器（可选） */
    audio?: IAudioManager;
    /** 网络管理器（可选） */
    network?: INetworkManager;
    /** 热更新管理器（可选） */
    hotupdate?: IHotupdateManager;
    
    /** 初始化引擎 */
    init(config?: EngineConfig): Promise<void>;
    /** 销毁引擎 */
    destroy(): void;
}

