import { _decorator, Component, EventTarget, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 全局事件定义
 */
export class Events {
    /**
     * uiRoot节点发生变化
     */
    static onUIRootChanged: string = "onUIRootChanged";
    /**
     * 设置面板的背景音乐音量变化
     */
    static onBgmVolumeChanged: string = "onBgmVolumeChanged";
    /**
     * 子包卸载
     */
    static onBundleRlease: string = "onBundleRlease";

    /**
     * 触摸界面开始
     */
    static onGameTouchStart: string = "onGameTouchStart";
    static onGameTouchMove: string = "onGameTouchMove";
    static onGameTouchEnd: string = "onGameTouchEnd";
    static onGameTouchCancel: string = "onGameTouchCancel";

    /**
     * manger init 结束
     */
    static MANAGER_INIT_END = "MANAGER_INIT_END";
}