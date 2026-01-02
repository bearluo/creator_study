/**
 * TargetViewAdapter - 共享的 IView 实现，聚合多个 ViewTarget 实例
 * 
 * 用于 BindingBuilder，作为统一的事件总线和映射层
 */
import type { IView } from '@bl-framework/mvvm';
import type { ViewTarget } from '../types/view-target';

/**
 * 目标项
 */
interface TargetItem {
    id: string;
    target: ViewTarget<any>;
    unsubscribe?: () => void;
}

/**
 * 目标视图适配器
 * 
 * 职责：
 * - 统一事件总线（change 事件，支持 sourceId）
 * - dataPath → view targets 映射（一个 path 可对应多个 target）
 * - 不解析 path，只做映射
 */
export class TargetViewAdapter implements IView {
    /** 一个 path 可对应多个 target */
    private targets = new Map<string, TargetItem[]>();
    /** change 事件监听器（三参：path, value, sourceId） */
    private changeListeners = new Set<(path: string, value: any, sourceId?: string) => void>();
    /** targetId 计数器（用于生成唯一 ID） */
    private targetIdCounter = 0;
    
    /**
     * 添加目标
     * 
     * @param path 数据路径
     * @param target 视图目标
     * @returns targetId（用于传递给 DataBinding 的 sourceId）
     */
    addTarget(path: string, target: ViewTarget<any>): string {
        // 生成唯一 targetId
        const targetId = `target_${this.targetIdCounter++}`;
        
        // 获取或创建 target 数组
        let targetList = this.targets.get(path);
        if (!targetList) {
            targetList = [];
            this.targets.set(path, targetList);
        }
        
        // 创建 target 项
        const item: TargetItem = {
            id: targetId,
            target: target
        };
        
        // 如果 target 支持 onChange，注册监听（包装回调，传递 targetId）
        if (target.onChange) {
            item.unsubscribe = target.onChange((value: any) => {
                // 触发 change 事件，传递 targetId 作为 sourceId
                this._emitChange(path, value, targetId);
            });
        }
        
        targetList.push(item);
        return targetId;
    }
    
    /**
     * 移除目标
     * 
     * @param path 数据路径
     * @param targetId 目标 ID（可选，如果不提供则移除该 path 的所有 target）
     */
    removeTarget(path: string, targetId?: string): void {
        const targetList = this.targets.get(path);
        if (!targetList) return;
        
        if (targetId) {
            // 移除指定的 target
            const index = targetList.findIndex(item => item.id === targetId);
            if (index !== -1) {
                const item = targetList[index];
                item.unsubscribe?.();
                item.target.dispose?.();
                targetList.splice(index, 1);
            }
            
            // 如果数组为空，删除整个 path
            if (targetList.length === 0) {
                this.targets.delete(path);
            }
        } else {
            // 移除该 path 的所有 target
            for (const item of targetList) {
                item.unsubscribe?.();
                item.target.dispose?.();
            }
            this.targets.delete(path);
        }
    }
    
    /**
     * 更新视图（只写不 emit）
     * 
     * 更新该 path 的所有 target
     * 
     * @param path 数据路径
     * @param value 值
     */
    update(path: string, value: any): void {
        const targetList = this.targets.get(path);
        if (!targetList || targetList.length === 0) {
            console.warn(`[TargetViewAdapter] No target for path: ${path}`);
            return;
        }
        
        // 更新所有 target
        for (const item of targetList) {
            item.target.set(value);
        }
    }
    
    /**
     * 获取视图值
     * 
     * 返回第一个 target 的值（如果有多个 target，通常只取第一个）
     * 
     * @param path 数据路径
     * @returns 视图值
     */
    get(path: string): any {
        const targetList = this.targets.get(path);
        if (!targetList || targetList.length === 0) {
            return undefined;
        }
        return targetList[0].target.get?.();
    }
    
    /**
     * 设置视图值（写 + emit，用于模拟用户输入）
     * 
     * @param path 数据路径
     * @param value 值
     */
    set(path: string, value: any): void {
        this.update(path, value);
        // set 不传递 sourceId（表示程序更新，不是用户输入）
        this._emitChange(path, value);
    }
    
    /**
     * 监听视图事件
     * 
     * @param event 事件名称（主要支持 'change'）
     * @param callback 回调函数（change 事件：path, value, sourceId）
     * @returns 取消订阅函数
     */
    on(event: string, callback: (...args: any[]) => void): () => void {
        if (event === 'change') {
            const fn = callback as (path: string, value: any, sourceId?: string) => void;
            this.changeListeners.add(fn);
            return () => {
                this.changeListeners.delete(fn);
            };
        }
        
        // 其他 event：console.warn + 返回空 unsubscriber（不 throw）
        console.warn(`[TargetViewAdapter] Unsupported event "${event}"`);
        return () => {};
    }
    
    /**
     * 销毁视图适配器
     */
    destroy(): void {
        // 安全迭代：先收集所有路径，再逐个移除
        const paths = Array.from(this.targets.keys());
        for (const path of paths) {
            this.removeTarget(path);
        }
        
        // 清空监听器
        this.changeListeners.clear();
    }
    
    /**
     * 触发 change 事件（内部方法，支持 sourceId）
     * 
     * @param path 数据路径
     * @param value 值
     * @param sourceId 源标识（可选，用于多 input 防回环）
     */
    private _emitChange(path: string, value: any, sourceId?: string): void {
        for (const callback of this.changeListeners) {
            callback(path, value, sourceId);
        }
    }
}

