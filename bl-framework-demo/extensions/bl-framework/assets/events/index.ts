/**
 * Event system
 * 
 * Re-export from @bl-framework/core and add framework-specific events
 * UMD 格式，防止被 default 包装
 */

// 使用 import * as 导入，然后解包 default（如果存在）
import * as coreModule from '@bl-framework/core';

// 解包 default 包装（UMD/CommonJS 模块可能被包装）
const core = (coreModule as any).default || coreModule;

// 重新导出所有内容（使用 Object.keys 动态导出）
for (const key in core) {
    if (key !== 'default' && Object.prototype.hasOwnProperty.call(core, key)) {
        (exports as any)[key] = core[key];
    }
}

// 类型导出（类型不会被 default 包装）
export type {
    EventMap,
    EventName,
} from '@bl-framework/core';

// 导入类型用于扩展（类型不会被 default 包装）
import type { EventMap } from '@bl-framework/core';
// Framework-specific event definitions
import { Node, EventTouch, Component } from 'cc';

/**
 * 框架事件名称常量
 * 
 * 从 IFWEvents 接口中提取所有事件名称常量
 * 用于避免字符串硬编码,提供类型安全的事件名称
 */
export const FWEventNames = {
    // UI相关事件
    ON_UI_ROOT_CHANGED: 'ON_UI_ROOT_CHANGED' as const,
    // 音频相关事件
    ON_BGM_VOLUME_CHANGED: 'ON_BGM_VOLUME_CHANGED' as const,
    // 资源管理相关事件
    ON_BUNDLE_RELEASE: 'ON_BUNDLE_RELEASE' as const,
    // 触摸输入相关事件
    ON_GAME_TOUCH_START: 'ON_GAME_TOUCH_START' as const,
    ON_GAME_TOUCH_MOVE: 'ON_GAME_TOUCH_MOVE' as const,
    ON_GAME_TOUCH_END: 'ON_GAME_TOUCH_END' as const,
    ON_GAME_TOUCH_CANCEL: 'ON_GAME_TOUCH_CANCEL' as const,
    // 系统管理相关事件
    MANAGER_INIT_END: 'MANAGER_INIT_END' as const,
} as const;

/**
 * 框架全局事件类型映射
 * 
 * 定义了整个框架中使用的事件名称及其参数类型
 * 提供完整的类型安全支持
 * 
 * 基于 @bl-framework/core 的 EventMap 类型
 */
export interface IFWEvents extends EventMap {
    // ==================== UI相关事件 ====================
    
    /**
     * UI根节点发生变化事件
     * 
     * 当场景中的UI根节点（UIRoot）发生变化时触发
     * 通常用于通知其他组件UI层级结构已更新
     */
    'ON_UI_ROOT_CHANGED': [uiRoot: Component];

    // ==================== 音频相关事件 ====================
    
    /**
     * 背景音乐音量变化事件
     * 
     * 当用户在设置面板中调整背景音乐音量时触发
     * 用于同步更新所有相关的音频组件
     * 
     * @param volume - 新的音量值 (0.0 - 1.0)
     */
    'ON_BGM_VOLUME_CHANGED': [volume: number];

    // ==================== 资源管理相关事件 ====================
    
    /**
     * 子包释放事件
     * 
     * 当动态加载的子包被释放时触发
     * 用于清理相关资源和通知依赖组件
     * 
     * @param bundleName - 被释放的子包名称
     */
    'ON_BUNDLE_RELEASE': [bundleName: string];

    // ==================== 触摸输入相关事件 ====================
    
    /**
     * 游戏触摸开始事件
     * 
     * 当用户在游戏界面上开始触摸时触发
     * 
     * @param event - 触摸事件对象
     */
    'ON_GAME_TOUCH_START': [event: EventTouch];
    
    /**
     * 游戏触摸移动事件
     * 
     * 当用户在游戏界面上移动触摸时触发
     * 
     * @param event - 触摸事件对象
     */
    'ON_GAME_TOUCH_MOVE': [event: EventTouch];
    
    /**
     * 游戏触摸结束事件
     * 
     * 当用户在游戏界面上结束触摸时触发
     * 
     * @param event - 触摸事件对象
     */
    'ON_GAME_TOUCH_END': [event: EventTouch];
    
    /**
     * 游戏触摸取消事件
     * 
     * 当用户的触摸被系统取消时触发（如来电、通知等）
     * 
     * @param event - 触摸事件对象
     */
    'ON_GAME_TOUCH_CANCEL': [event: EventTouch];

    // ==================== 系统管理相关事件 ====================
    
    /**
     * 管理器初始化完成事件
     * 
     * 当所有核心管理器初始化完成后触发
     * 通常用于通知游戏可以开始正常运行
     */
    'MANAGER_INIT_END': [];
}

/**
 * 事件名称类型
 * 
 * 从 IFWEvents 接口中提取所有事件名称
 */
export type FWEventName = keyof IFWEvents;

