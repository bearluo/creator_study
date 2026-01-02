/**
 * Cocos Creator 类型定义
 */
import * as cc from 'cc';

/**
 * Component 构造函数类型（Creator 习惯的 Component 构造签名）
 */
export type ComponentCtor<T extends cc.Component = cc.Component> = new (...args: any[]) => T;

/**
 * 基础映射接口
 */
export interface BaseMapping {
    /** 目标对象（Node 或 Component） */
    target: cc.Node | cc.Component;
    
    /** 
     * 如果 target 是 Node 且要取组件时才需要；Node 字段（如 active）不需要 ctor 
     */
    componentCtor?: ComponentCtor;
    
    /** 
     * 从 resolveRoot() 返回的 root（Node 或 Component）开始走的路径
     * 比如 ['string'] / ['color'] / ['progress'] / ['active']
     * 必填，>=1；从 root 对象开始走
     */
    memberPath: string[];
    
    /** 可选清理钩子（不销毁节点，只解绑） */
    dispose?: () => void;
}

/**
 * 显示映射（只读，不需要输入监听）
 */
export interface DisplayMapping extends BaseMapping {
    kind: 'display';
}

/**
 * 输入映射（需要监听输入事件）
 */
export interface InputMapping extends BaseMapping {
    kind: 'input';
    
    /** 
     * 建立输入监听，返回 unsubscriber
     * ⚠️ **硬性实现约束**：bindInput 必须是工厂函数（接收 dataPath），不要直接捕获循环变量
     */
    bindInput(adapter: any, dataPath: string): () => void;
    
    /** 
     * 静默保护：用计数器更稳（内部使用）
     * 防止程序 set 引发输入事件回环
     */
    _silentDepth?: number;
}

/**
 * 视图映射类型（显示或输入）
 */
export type ViewMapping = DisplayMapping | InputMapping;

