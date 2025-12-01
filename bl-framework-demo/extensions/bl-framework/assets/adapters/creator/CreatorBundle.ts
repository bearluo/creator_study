/**
 * Creator 资源包适配器
 */

import { AssetManager } from 'cc';
import { IBundle } from '@bl-framework/core';

/**
 * Creator 资源包适配器
 */
export class CreatorBundle implements IBundle {
    private bundle: AssetManager.Bundle;
    
    constructor(bundle: AssetManager.Bundle) {
        this.bundle = bundle;
    }
    
    get name(): string {
        return this.bundle.name;
    }
    
    async load<T = any>(path: string, type?: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.bundle.load(path, type as any, (err: Error | null, asset: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(asset as T);
                }
            });
        });
    }
    
    release(): void {
        this.bundle.releaseAll();
    }
}

