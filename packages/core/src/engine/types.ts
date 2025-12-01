/**
 * 引擎抽象层通用类型定义
 */

/**
 * 引擎配置
 */
export interface EngineConfig {
    /** 是否启用场景管理 */
    enableScene?: boolean;
    /** 是否启用音频管理 */
    enableAudio?: boolean;
    /** 是否启用网络管理 */
    enableNetwork?: boolean;
    /** 是否启用热更新 */
    enableHotupdate?: boolean;
    /** 自定义配置 */
    [key: string]: any;
}

/**
 * 资源包选项
 */
export interface BundleOptions {
    /** 版本号 */
    version?: string;
    /** 其他选项 */
    [key: string]: any;
}

/**
 * 资源加载错误
 */
export class ResourceLoadError extends Error {
    constructor(message: string, public originalError?: any) {
        super(message);
        this.name = 'ResourceLoadError';
    }
}

/**
 * 向量接口（2D）
 */
export interface IVec2 {
    x: number;
    y: number;
    /** 设置值 */
    set(x: number, y: number): void;
    /** 克隆 */
    clone(): IVec2;
}

/**
 * 向量接口（3D）
 */
export interface IVec3 {
    x: number;
    y: number;
    z: number;
    /** 设置值 */
    set(x: number, y: number, z: number): void;
    /** 克隆 */
    clone(): IVec3;
}

/**
 * 向量接口（4D）
 */
export interface IVec4 {
    x: number;
    y: number;
    z: number;
    w: number;
    /** 设置值 */
    set(x: number, y: number, z: number, w: number): void;
    /** 克隆 */
    clone(): IVec4;
}

/**
 * 颜色接口
 */
export interface IColor {
    r: number;
    g: number;
    b: number;
    a: number;
    /** 设置值 */
    set(r: number, g: number, b: number, a: number): void;
    /** 克隆 */
    clone(): IColor;
}

/**
 * 精灵帧接口
 */
export interface ISpriteFrame {
    /** 精灵帧路径 */
    path: string;
    /** 精灵帧数据 */
    data: any;
}