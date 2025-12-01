/**
 * 引擎服务定位器
 * 提供全局访问引擎实例的方式
 */

import { IEngine } from './IEngine';
import { IResourceManager } from './IResourceManager';
import { IUIManager } from './IUIManager';
import { ISceneManager } from './ISceneManager';
import { IAudioManager } from './IAudioManager';
import { INetworkManager } from './INetworkManager';
import { IHotupdateManager } from './IHotupdateManager';

/**
 * 引擎服务定位器
 */
export class EngineServiceLocator {
    private static engine: IEngine | null = null;
    private static initialized: boolean = false;
    
    /**
     * 注册引擎实例
     */
    static register(engine: IEngine): void {
        if (this.engine) {
            console.warn('Engine already registered. Replacing existing engine.');
        }
        this.engine = engine;
        this.initialized = true;
    }
    
    /**
     * 获取引擎实例
     */
    static getEngine(): IEngine {
        if (!this.engine) {
            throw new Error(
                'Engine not registered. ' +
                'Please call EngineServiceLocator.register(engine) before using the framework.'
            );
        }
        return this.engine;
    }
    
    /**
     * 检查引擎是否已注册
     */
    static isInitialized(): boolean {
        return this.initialized;
    }
    
    /**
     * 获取资源管理器
     */
    static getResourceManager(): IResourceManager {
        return this.getEngine().resource;
    }
    
    /**
     * 获取 UI 管理器
     */
    static getUIManager(): IUIManager {
        return this.getEngine().ui;
    }
    
    /**
     * 获取场景管理器（可选）
     */
    static getSceneManager(): ISceneManager | null {
        return this.getEngine().scene || null;
    }
    
    /**
     * 获取音频管理器（可选）
     */
    static getAudioManager(): IAudioManager | null {
        return this.getEngine().audio || null;
    }
    
    /**
     * 获取网络管理器（可选）
     */
    static getNetworkManager(): INetworkManager | null {
        return this.getEngine().network || null;
    }
    
    /**
     * 获取热更新管理器（可选）
     */
    static getHotupdateManager(): IHotupdateManager | null {
        return this.getEngine().hotupdate || null;
    }
    
    /**
     * 重置（主要用于测试）
     */
    static reset(): void {
        this.engine = null;
        this.initialized = false;
    }
}

