/**
 * Cocos Creator 引擎适配器
 */

import { IEngine, EngineConfig } from '@bl-framework/core';
import { CreatorResourceManager } from './CreatorResourceManager';
import { CreatorUIManager } from './CreatorUIManager';
import { CreatorAudioManager } from './CreatorAudioManager';

/**
 * Cocos Creator 引擎适配器
 */
export class CreatorEngine implements IEngine {
    public resource: CreatorResourceManager;
    public ui: CreatorUIManager;
    public scene?: any; // ISceneManager - 待实现
    public audio?: CreatorAudioManager;
    public network?: any; // INetworkManager - 待实现
    public hotupdate?: any; // IHotupdateManager - 待实现
    
    constructor() {
        // 初始化各个子系统适配器
        this.resource = new CreatorResourceManager();
        this.ui = new CreatorUIManager();
        this.audio = new CreatorAudioManager();
        // scene, network, hotupdate 可选，后续实现
    }
    
    async init(config?: EngineConfig): Promise<void> {
        // 初始化 Creator 引擎
        // 可以在这里进行引擎特定的初始化
        if (config?.enableAudio !== false) {
            // 初始化音频管理器
            this.audio?.init();
        }
        if (config) {
            // 根据配置初始化可选子系统
            // ...
        }
    }
    
    destroy(): void {
        // 清理资源
        this.resource = null as any;
        this.ui = null as any;
        this.scene = undefined;
        this.audio = undefined;
        this.network = undefined;
        this.hotupdate = undefined;
    }
}

