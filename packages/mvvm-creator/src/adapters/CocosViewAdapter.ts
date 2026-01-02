/**
 * CocosViewAdapter - 实现 IView 接口，适配 Cocos Creator 的 Node 和 Component
 * 
 * 方案 3.2 最终版：统一路径格式方案（memberPath + 静默更新保护 + 类型精确 + Node 支持）
 */
import * as cc from 'cc';
import type { IView } from '@bl-framework/mvvm';
import type { ViewMapping, DisplayMapping, InputMapping } from '../types/cocos';

/**
 * CocosViewAdapter 配置
 */
export interface CocosViewAdapterConfig {
    /** 根节点（用于 BindingBuilder 解析，Adapter 本身不解析路径） */
    rootNode: cc.Node;
    /** 组件实例（可选，用于 BindingBuilder 解析） */
    componentInstance?: any;
}

/**
 * Cocos Creator 视图适配器
 * 
 * 职责：
 * - 统一事件总线（change 事件）
 * - dataPath → view target 映射（O(1) Map 查找）
 * - 不解析 path，只做映射
 * - update()：只写不 emit
 * - set()：写 + emit（仅模拟输入）
 */
export class CocosViewAdapter implements IView {
    private mappings = new Map<string, ViewMapping>();
    private changeListeners = new Set<(path: string, value: any) => void>();
    private inputUnsubs: Array<() => void> = [];
    
    constructor(config: CocosViewAdapterConfig) {
        // rootNode 和 componentInstance 可以存储，但主要用于 BindingBuilder 解析
        // Adapter 本身只负责映射管理
    }
    
    /**
     * 添加映射
     * 
     * @param dataPath 数据路径（key）
     * @param mapping 视图映射
     */
    addMapping(dataPath: string, mapping: ViewMapping): void {
        // 检测重复映射
        if (this.mappings.has(dataPath)) {
            throw new Error(`[CocosViewAdapter] Duplicate mapping for dataPath: ${dataPath}`);
        }
        
        // 验证 memberPath 至少 1 段
        if (!mapping.memberPath || mapping.memberPath.length === 0) {
            throw new Error(`[CocosViewAdapter] memberPath must have at least 1 segment`);
        }
        
        this.mappings.set(dataPath, mapping);
        
        // 如果 mapping 带 input 监听能力，在这里注册
        if (mapping.kind === 'input') {
            const un = mapping.bindInput(this, dataPath);
            if (typeof un === 'function') {
                this.inputUnsubs.push(un);
            }
        }
    }
    
    /**
     * 更新视图（只写不 emit）
     * 
     * @param path 数据路径
     * @param value 值
     */
    update(path: string, value: any): void {
        const mapping = this.mappings.get(path);
        if (!mapping) {
            console.warn(`[CocosViewAdapter] No mapping for path: ${path}`);
            return;
        }
        this._setByMapping(path, mapping, value);
    }
    
    /**
     * 获取视图值
     * 
     * @param path 数据路径
     * @returns 视图值
     */
    get(path: string): any {
        const mapping = this.mappings.get(path);
        if (!mapping) {
            return undefined;
        }
        return this._getByMapping(mapping);
    }
    
    /**
     * 设置视图值（写 + emit，用于模拟用户输入）
     * 
     * @param path 数据路径
     * @param value 值
     */
    set(path: string, value: any): void {
        this.update(path, value);
        this._emitChange(path, value);
    }
    
    /**
     * 监听视图事件
     * 
     * @param event 事件名称（主要支持 'change'）
     * @param callback 回调函数
     * @returns 取消订阅函数
     */
    on(event: string, callback: (...args: any[]) => void): () => void {
        if (event === 'change') {
            const fn = callback as (path: string, value: any) => void;
            this.changeListeners.add(fn);
            return () => {
                this.changeListeners.delete(fn);
            };
        }
        
        // 其他 event：console.warn + 返回空 unsubscriber（不 throw）
        console.warn(`[CocosViewAdapter] Unsupported event "${event}"`);
        return () => {};
    }
    
    /**
     * 销毁视图适配器
     */
    destroy(): void {
        // 1. 解绑输入事件
        for (const un of this.inputUnsubs) {
            un();
        }
        this.inputUnsubs.length = 0;
        
        // 2. 清理 mapping 内资源（可选清理钩子）
        for (const mapping of this.mappings.values()) {
            mapping.dispose?.();
        }
        
        // 3. 清空映射和监听器
        this.mappings.clear();
        this.changeListeners.clear();
    }
    
    /**
     * 触发 change 事件（给 InputMapping 用）
     * 
     * @param path 数据路径
     * @param value 值
     */
    emitChange(path: string, value: any): void {
        this._emitChange(path, value);
    }
    
    /**
     * 解析根对象（Node 或 Component）
     * 
     * 支持三类 root：
     * - target is Component → root=component
     * - target is Node + componentCtor → root=node.getComponent(ctor)
     * - target is Node + no ctor → root=node（Node.active/position/...）
     */
    private _resolveRoot(mapping: ViewMapping): cc.Node | cc.Component | null {
        const t = mapping.target;
        // 运行时用 cc.Component / cc.Node 判断（import type 会被擦除）
        if (t instanceof cc.Component) {
            return t;
        }
        
        // t is Node
        if (mapping.componentCtor) {
            return t.getComponent(mapping.componentCtor);
        }
        
        // 允许 Node 直接作为 root（Node.active 等）
        return t;
    }
    
    /**
     * 走到父对象（用于 set）
     * 
     * @returns { parent: any; key: string } | null
     * 
     * ⚠️ **硬性约束**：memberPath 只用于访问已存在字段，不做 auto-create
     * - 如果中间层为空，直接 warn 并返回 null
     * - UI 侧字段路径必须存在（比如 Label.string 永远存在）
     * - 不允许自动创建中间对象
     */
    private _walkToParent(root: any, path: string[]): { parent: any; key: string } | null {
        let obj = root;
        for (let i = 0; i < path.length - 1; i++) {
            obj = obj?.[path[i]];
            if (obj == null) {
                return null;  // 0/false/'' 不会触发 == null，OK
        }
        }
        return { parent: obj, key: path[path.length - 1] };
    }
    
    /**
     * 根据映射设置值（核心逻辑 - 方案 3.2 真·最终版）
     * 
     * 逻辑：
     * 1. resolveRoot：拿到 root 对象（Node 或 Component）
     * 2. walkToParent：走到父对象
     * 3. 如果是 InputMapping，在写入时 silentDepth 包起来（计数器 + try/finally）
     * 
     * @param dataPath 数据路径（用于错误提示）
     * @param mapping 视图映射
     * @param value 值
     */
    private _setByMapping(dataPath: string, mapping: ViewMapping, value: any): void {
        // 1. resolveRoot：拿到 root 对象
        const root = this._resolveRoot(mapping);
        if (!root) {
            console.warn(`[CocosViewAdapter] Cannot resolve root for "${dataPath}"`, mapping);
            return;
    }
    
        // 2. walkToParent：走到父对象
        const info = this._walkToParent(root, mapping.memberPath);
        if (!info) {
            console.warn(`[CocosViewAdapter] Cannot access path ${mapping.memberPath.join('.')} for "${dataPath}"`);
            return;
        }
        
        // 3. 如果是 InputMapping，在写入时 silentDepth 包起来（防止程序 set 引发输入事件回环）
        if (mapping.kind === 'input') {
            mapping._silentDepth = (mapping._silentDepth ?? 0) + 1;
        }
        
        try {
            info.parent[info.key] = value;
        } finally {
            // 使用 try/finally 保证恢复，即使异常也能恢复
            if (mapping.kind === 'input') {
                mapping._silentDepth = (mapping._silentDepth ?? 1) - 1;
            }
        }
    }
    
    /**
     * 根据映射获取值（核心逻辑 - 方案 3.2 真·最终版）
     * 
     * 逻辑：
     * 1. resolveRoot：拿到 root 对象
     * 2. walk memberPath：最后一段 get
     */
    private _getByMapping(mapping: ViewMapping): any {
        // 1. resolveRoot：拿到 root 对象
        const root = this._resolveRoot(mapping);
        if (!root) {
            return undefined;
        }
        
        // 2. walk memberPath：最后一段 get
        let obj: any = root;
        for (const key of mapping.memberPath) {
            obj = obj?.[key];
            if (obj == null) {
                return undefined;  // 0/false/'' 不会触发 == null，OK
            }
        }
        
        return obj;
    }
    
    /**
     * 触发 change 事件（内部方法）
     */
    private _emitChange(path: string, value: any): void {
        for (const callback of this.changeListeners) {
            callback(path, value);
    }
}
}
