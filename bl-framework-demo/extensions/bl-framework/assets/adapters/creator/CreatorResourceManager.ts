/**
 * Creator 资源管理器适配器
 */

import { assetManager, Asset, AssetManager } from 'cc';
import { 
    IResourceManager, 
    IAsset, 
    IBundle, 
    BundleOptions,
    ResourceLoadError 
} from '@bl-framework/core';
import { CreatorBundle } from './CreatorBundle';

/**
 * Creator 资源管理器适配器
 */
export class CreatorResourceManager implements IResourceManager {
    /**
     * 加载资源
     */
    async loadAsset<T = any>(path: string, type?: string): Promise<T> {
        try {
            return new Promise((resolve, reject) => {
                assetManager.loadAny(
                    { path, type: type as any },
                    (err: Error | null, asset: Asset | null) => {
                        if (err) {
                            reject(new ResourceLoadError(`Failed to load asset: ${path}`, err));
                        } else if (!asset) {
                            reject(new ResourceLoadError(`Asset not found: ${path}`));
                        } else {
                            resolve(asset as T);
                        }
                    }
                );
            });
        } catch (error) {
            throw new ResourceLoadError(`Failed to load asset: ${path}`, error);
        }
    }
    
    /**
     * 加载资源包
     */
    async loadBundle(name: string, options?: BundleOptions): Promise<IBundle> {
        try {
            return new Promise((resolve, reject) => {
                assetManager.loadBundle(name, (err: Error | null, bundle: AssetManager.Bundle | null) => {
                    if (err) {
                        reject(new ResourceLoadError(`Failed to load bundle: ${name}`, err));
                    } else if (!bundle) {
                        reject(new ResourceLoadError(`Bundle not found: ${name}`));
                    } else {
                        resolve(new CreatorBundle(bundle));
                    }
                });
            });
        } catch (error) {
            throw new ResourceLoadError(`Failed to load bundle: ${name}`, error);
        }
    }
    
    /**
     * 释放资源
     */
    releaseAsset(asset: IAsset): void {
        if (asset && (asset as any).isValid !== false) {
            assetManager.releaseAsset(asset as any);
        }
    }
    
    /**
     * 释放资源包
     */
    releaseBundle(bundle: IBundle): void {
        if (bundle instanceof CreatorBundle) {
            bundle.release();
        }
    }
    
    /**
     * 预加载资源
     */
    async preload(paths: string[]): Promise<void> {
        const promises = paths.map(path => this.loadAsset(path));
        await Promise.all(promises);
    }
}

