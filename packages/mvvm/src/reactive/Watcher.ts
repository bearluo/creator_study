import type { Watcher as IWatcher } from '../core/types';

/**
 * 观察者（精简版）
 * 
 * 职责：
 * - 声明并维护依赖
 * - 在依赖变化时重新执行
 */
export class Watcher implements IWatcher {
    private runCallback?: () => void;
    private dependencies: Set<string> = new Set();
    
    constructor(
        runCallback?: () => void
    ) {
        this.runCallback = runCallback;
    }
    
    /**
     * 执行回调并重新收集依赖
     */
    run(): void {
        if (this.runCallback) {
            this.runCallback();
        }
    }
    
    /**
     * 添加依赖（由 reactive.track 调用）
     */
    addDependency(key: string): void {
        this.dependencies.add(key);
    }
    
    /**
     * 获取当前依赖集合
     */
    getDependencies(): ReadonlySet<string> {
        return this.dependencies;
    }
    
    /**
     * 清除依赖（run 前调用）
     */
    clearDependencies(): void {
        this.dependencies.clear();
    }
}
