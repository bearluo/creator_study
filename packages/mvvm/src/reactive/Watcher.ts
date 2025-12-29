import type { Watcher as IWatcher } from '../core/types';

/**
 * 观察者
 * 
 * 用于监听响应式数据的变化
 */
export class Watcher implements IWatcher {
    private callback: (key: string | symbol, newValue: any, oldValue: any) => void;
    private runCallback?: () => void;
    private dependencies: Set<string | symbol> = new Set();
    
    constructor(
        callback: (key: string | symbol, newValue: any, oldValue: any) => void,
        runCallback?: () => void
    ) {
        this.callback = callback;
        this.runCallback = runCallback;
    }
    
    /**
     * 更新回调
     */
    update(key: string | symbol, newValue: any, oldValue: any): void {
        this.callback(key, newValue, oldValue);
    }
    
    /**
     * 运行回调
     */
    run(): void {
        if (this.runCallback) {
            this.runCallback();
        }
    }
    
    /**
     * 添加依赖
     */
    addDependency(key: string | symbol): void {
        this.dependencies.add(key);
    }
    
    /**
     * 获取所有依赖
     */
    getDependencies(): ReadonlySet<string | symbol> {
        return this.dependencies;
    }
    
    /**
     * 清除依赖
     */
    clearDependencies(): void {
        this.dependencies.clear();
    }
}
