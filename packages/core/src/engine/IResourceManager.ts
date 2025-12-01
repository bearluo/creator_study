/**
 * 资源管理器接口
 */
export interface IResourceManager {
    /** 加载资源 */
    loadAsset<T = any>(path: string, type?: string): Promise<T>;
    /** 加载资源包 */
    loadBundle(name: string, options?: BundleOptions): Promise<IBundle>;
    /** 释放资源 */
    releaseAsset(asset: IAsset): void;
    /** 释放资源包 */
    releaseBundle(bundle: IBundle): void;
    /** 预加载资源 */
    preload(paths: string[]): Promise<void>;
}

/**
 * 资源接口
 */
export interface IAsset {
    /** 资源路径 */
    path: string;
    /** 资源类型 */
    type: string;
    /** 资源数据 */
    data: any;
    /** 释放资源 */
    release(): void;
}

/**
 * 资源包接口
 */
export interface IBundle {
    /** 包名称 */
    name: string;
    /** 加载资源 */
    load<T = any>(path: string, type?: string): Promise<T>;
    /** 释放包 */
    release(): void;
}

import { BundleOptions } from './types';

