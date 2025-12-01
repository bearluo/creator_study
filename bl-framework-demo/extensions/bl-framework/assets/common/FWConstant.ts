import { Vec2, v2, Vec3, v3, Vec4, v4, color, Prefab, SpriteFrame, AudioClip } from 'cc';
import { 
    IVec2, 
    IVec3, 
    IVec4, 
    IColor, 
    IPrefab, 
    ISpriteFrame, 
    IAudioClip,
    EngineServiceLocator 
} from '@bl-framework/core';
import { IFWManagerBase } from '../declare/FWInterface';

// Creator 特定的向量实例（用于向后兼容）
const _v2 = v2();
const _v3 = v3();
const _v4 = v4();

/**
 * 常量工具类
 * 
 * 注意：为了保持向后兼容，仍然使用 Creator 类型作为静态属性
 * 但在新代码中，建议使用引擎抽象接口
 */
export class constant {
    /**
     * 获取 2D 向量（向后兼容，返回 Creator Vec2）
     * 新代码建议使用 EngineServiceLocator.getUIManager() 创建节点
     */
    static get v2(): Vec2 {
        return _v2;
    }

    /**
     * 获取 3D 向量（向后兼容，返回 Creator Vec3）
     */
    static get v3(): Vec3 {
        return _v3;
    }

    /**
     * 获取 4D 向量（向后兼容，返回 Creator Vec4）
     */
    static get v4(): Vec4 {
        return _v4;
    }

    /**
     * 颜色常量（向后兼容，使用 Creator color）
     */
    static color = {
        mask: color(0, 0, 0, 180),
    };

    /**
     * 默认加载预制体（Creator 类型，向后兼容）
     */
    static default_loadPrefab: Prefab;

    /**
     * 默认启动画面精灵帧（Creator 类型，向后兼容）
     */
    static default_sprite_splash: SpriteFrame;

    /**
     * 加密密钥
     */
    static encrypt_key = "b9d27fa6b64db9390678aa4fe42bdf84";

    /**
     * 调试配置
     */
    static DEBUG = {
        bDev: true,
    };

    /**
     * 按钮点击音效剪辑（Creator 类型，向后兼容）
     */
    static button_click_sfx_clip: AudioClip;

    /**
     * 创建 2D 向量（使用引擎抽象接口）
     * 新代码建议使用此方法
     */
    static createVec2(x: number = 0, y: number = 0): IVec2 {
        const vec = v2(x, y);
        return {
            x: vec.x,
            y: vec.y,
            set: (x: number, y: number) => vec.set(x, y),
            clone: () => constant.createVec2(vec.x, vec.y),
        };
    }

    /**
     * 创建 3D 向量（使用引擎抽象接口）
     */
    static createVec3(x: number = 0, y: number = 0, z: number = 0): IVec3 {
        const vec = v3(x, y, z);
        return {
            x: vec.x,
            y: vec.y,
            z: vec.z,
            set: (x: number, y: number, z: number) => vec.set(x, y, z),
            clone: () => constant.createVec3(vec.x, vec.y, vec.z),
        };
    }

    /**
     * 创建 4D 向量（使用引擎抽象接口）
     */
    static createVec4(x: number = 0, y: number = 0, z: number = 0, w: number = 0): IVec4 {
        const vec = v4(x, y, z, w);
        return {
            x: vec.x,
            y: vec.y,
            z: vec.z,
            w: vec.w,
            set: (x: number, y: number, z: number, w: number) => vec.set(x, y, z, w),
            clone: () => constant.createVec4(vec.x, vec.y, vec.z, vec.w),
        };
    }

    /**
     * 创建颜色（使用引擎抽象接口）
     */
    static createColor(r: number = 255, g: number = 255, b: number = 255, a: number = 255): IColor {
        const col = color(r, g, b, a);
        return {
            r: col.r,
            g: col.g,
            b: col.b,
            a: col.a,
            set: (r: number, g: number, b: number, a: number) => col.set(r, g, b, a),
            clone: () => constant.createColor(col.r, col.g, col.b, col.a),
        };
    }
}

/**
 * 管理器数组
 */
export const managerObject: IFWManagerBase[] = [];

/**
 * 数据键常量
 */
export const data_key = {
    setting: "setting",
};
